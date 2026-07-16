import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { displayHandle } from '../../lib/creatorPosts';
import {
  applyProfileToComment,
  createComment,
  deleteComment,
  fetchCommentsForPost,
  formatCommentTime,
  streamSupportsComments,
} from '../../lib/postComments';
import { cookTheme } from '../../theme/cookTheme';
import type { PostComment } from '../../types/comments';
import type { LiveStream } from '../../types/live';
import { CreatorAvatar } from './CreatorAvatar';

type Props = {
  visible: boolean;
  stream: LiveStream | null;
  onClose: () => void;
  onCommentCountChange?: (postId: string, count: number) => void;
};

function CommentRow({
  comment,
  canDelete,
  onDelete,
}: {
  comment: PostComment;
  canDelete: boolean;
  onDelete: (id: string) => void;
}) {
  return (
    <View className="mb-4 flex-row gap-3">
      <CreatorAvatar uri={comment.authorAvatar} name={comment.authorName} size={36} />
      <View className="min-w-0 flex-1">
        <View className="flex-row items-center gap-2">
          <Text className="text-[13px] text-white" style={{ fontFamily: 'DMSans_600SemiBold' }}>
            {comment.authorHandle}
          </Text>
          <Text className="text-[11px]" style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}>
            {formatCommentTime(comment.createdAt)}
          </Text>
        </View>
        <Text
          className="mt-0.5 text-[14px] leading-5 text-white/95"
          style={{ fontFamily: 'DMSans_400Regular' }}
        >
          {comment.body}
        </Text>
      </View>
      {canDelete ? (
        <Pressable onPress={() => onDelete(comment.id)} hitSlop={8} className="pt-0.5">
          <Ionicons name="trash-outline" size={16} color={cookTheme.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}

export function CommentsSheet({ visible, stream, onClose, onCommentCountChange }: Props) {
  const { user, profile } = useAuth();
  const [comments, setComments] = useState<PostComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<FlatList<PostComment>>(null);
  const onCommentCountChangeRef = useRef(onCommentCountChange);

  useEffect(() => {
    onCommentCountChangeRef.current = onCommentCountChange;
  }, [onCommentCountChange]);

  const supported = stream ? streamSupportsComments(stream.creatorId) : false;
  const postId = stream?.id ?? '';

  const loadComments = useCallback(async () => {
    if (!postId || !supported) {
      setComments([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const rows = await fetchCommentsForPost(postId);
      setComments(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load questions');
    } finally {
      setLoading(false);
    }
  }, [postId, supported]);

  useEffect(() => {
    if (!visible) {
      setDraft('');
      setError(null);
      setComments([]);
      return;
    }
    void loadComments();
  }, [visible, loadComments]);

  useEffect(() => {
    if (!visible || !postId || !supported) return;
    onCommentCountChangeRef.current?.(postId, comments.length);
  }, [comments.length, postId, supported, visible]);

  useEffect(() => {
    if (!visible || comments.length === 0) return;
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: false });
    });
  }, [comments.length, visible]);

  const displayComments = useMemo(() => {
    if (!profile) return comments;
    return comments.map((comment) => applyProfileToComment(comment, profile));
  }, [comments, profile]);

  const onSubmit = async () => {
    if (!stream || !user || !supported || submitting) return;

    const body = draft.trim();
    if (!body) return;

    setSubmitting(true);
    setError(null);

    const optimistic: PostComment = profile
      ? applyProfileToComment(
          {
            id: `temp-${Date.now()}`,
            postId: stream.id,
            authorId: user.id,
            body,
            createdAt: new Date().toISOString(),
            authorHandle: displayHandle(profile),
            authorName: profile.display_name ?? 'You',
            authorAvatar: profile.avatar_url?.trim() || null,
          },
          profile,
        )
      : {
          id: `temp-${Date.now()}`,
          postId: stream.id,
          authorId: user.id,
          body,
          createdAt: new Date().toISOString(),
          authorHandle: '@you',
          authorName: 'You',
          authorAvatar: null,
        };

    setComments((prev) => [...prev, optimistic]);
    setDraft('');

    try {
      const saved = await createComment({
        postId: stream.id,
        authorId: user.id,
        body,
      });

      if (saved) {
        const merged = profile ? applyProfileToComment(saved, profile) : saved;
        setComments((prev) => prev.map((row) => (row.id === optimistic.id ? merged : row)));
      }
    } catch (e) {
      setComments((prev) => prev.filter((row) => row.id !== optimistic.id));
      setDraft(body);
      setError(e instanceof Error ? e.message : 'Could not post question');
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (commentId: string) => {
    if (commentId.startsWith('temp-')) return;

    const previous = comments;
    setComments(comments.filter((row) => row.id !== commentId));

    try {
      await deleteComment(commentId);
    } catch (e) {
      setComments(previous);
      setError(e instanceof Error ? e.message : 'Could not delete question');
    }
  };

  if (!stream) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/55" onPress={onClose}>
        <Pressable
          className="rounded-t-3xl pt-4"
          style={{ backgroundColor: cookTheme.surface, maxHeight: '78%' }}
          onPress={(e) => e.stopPropagation()}
        >
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View className="px-5 pb-2">
              <View className="mb-4 items-center">
                <View className="mb-3 h-1 w-10 rounded-full bg-white/20" />
                <Text className="text-[22px] text-white" style={{ fontFamily: 'Syne_700Bold' }}>
                  Questions
                </Text>
                <Text
                  className="mt-1 text-center text-[13px]"
                  style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
                >
                  Ask {stream.chefName} about {stream.dishName}
                </Text>
              </View>
            </View>

            {!supported ? (
              <View className="px-5 pb-8">
                <Text
                  className="text-center text-[14px] leading-5"
                  style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
                >
                  Questions are only available on creator posts. This video is not linked to a CookMapz post yet.
                </Text>
              </View>
            ) : (
              <>
                <View style={{ minHeight: 180, maxHeight: 360 }}>
                  {loading ? (
                    <View className="flex-1 items-center justify-center py-10">
                      <ActivityIndicator color={cookTheme.accent} />
                    </View>
                  ) : comments.length === 0 ? (
                    <View className="flex-1 items-center justify-center px-8 py-10">
                      <Ionicons name="chatbubble-ellipses-outline" size={28} color={cookTheme.textMuted} />
                      <Text
                        className="mt-3 text-center text-[14px]"
                        style={{ fontFamily: 'DMSans_500Medium', color: cookTheme.textMuted }}
                      >
                        No questions yet. Be the first to ask about pickup, ingredients, or portions.
                      </Text>
                    </View>
                  ) : (
                    <FlatList
                      ref={listRef}
                      data={displayComments}
                      keyExtractor={(item) => item.id}
                      contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 12 }}
                      renderItem={({ item }) => (
                        <CommentRow
                          comment={item}
                          canDelete={
                            item.authorId === user?.id || stream.creatorId === user?.id
                          }
                          onDelete={onDelete}
                        />
                      )}
                    />
                  )}
                </View>

                {error ? (
                  <Text
                    className="px-5 pb-2 text-[12px]"
                    style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.live }}
                  >
                    {error}
                  </Text>
                ) : null}

                <View
                  className="flex-row items-end gap-2 border-t border-white/10 px-4 py-3"
                  style={{ paddingBottom: Platform.OS === 'ios' ? 28 : 16 }}
                >
                  <TextInput
                    value={draft}
                    onChangeText={setDraft}
                    placeholder="Ask a question…"
                    placeholderTextColor={cookTheme.textMuted}
                    multiline
                    maxLength={500}
                    editable={!submitting}
                    className="max-h-24 min-h-[44px] flex-1 rounded-2xl px-4 py-3 text-[15px] text-white"
                    style={{
                      fontFamily: 'DMSans_400Regular',
                      backgroundColor: cookTheme.surfaceElevated,
                    }}
                    onSubmitEditing={() => void onSubmit()}
                  />
                  <Pressable
                    onPress={() => void onSubmit()}
                    disabled={!draft.trim() || submitting}
                    className="mb-0.5 h-11 w-11 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: draft.trim() ? cookTheme.accent : 'rgba(255,255,255,0.08)',
                      opacity: submitting ? 0.6 : 1,
                    }}
                  >
                    {submitting ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Ionicons name="send" size={18} color="#fff" />
                    )}
                  </Pressable>
                </View>
              </>
            )}
          </KeyboardAvoidingView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
