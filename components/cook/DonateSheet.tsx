import { Ionicons } from '@expo/vector-icons';
import { Image, Modal, Pressable, Text, View } from 'react-native';
import { TICKET_TIERS } from '../../data/lives';
import { ticketsForStream } from '../../lib/tickets';
import { cookTheme } from '../../theme/cookTheme';
import type { LiveStream, TicketOffering } from '../../types/live';

type Props = {
  visible: boolean;
  stream: LiveStream | null;
  onClose: () => void;
  onAddTicket: (ticket: TicketOffering) => void;
};

/** @deprecated Use TicketSheet */
export const DonateSheet = TicketSheet;

export function TicketSheet({ visible, stream, onClose, onAddTicket }: Props) {
  if (!stream) return null;

  const tiers: TicketOffering[] = ticketsForStream(stream).length
    ? ticketsForStream(stream)
    : TICKET_TIERS.map((t) => ({
        id: t.id,
        label: t.label,
        description: t.perks,
        price: t.amount,
        imageUrl: stream.coverImage ?? null,
      }));

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/75" onPress={onClose}>
        <Pressable
          className="rounded-t-3xl px-5 pb-8 pt-4"
          style={{ backgroundColor: cookTheme.surface }}
          onPress={(e) => e.stopPropagation()}
        >
          <View className="mb-4 items-center">
            <View className="mb-3 h-1 w-10 rounded-full bg-white/20" />
            <Text className="text-[22px] text-white" style={{ fontFamily: 'Syne_700Bold' }}>
              Get a ticket
            </Text>
            <Text
              className="mt-1 text-center text-[13px]"
              style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
            >
              {stream.chefName} · watch {stream.dishName} cooked live
            </Text>
          </View>

          {tiers.map((ticket) => (
            <View
              key={ticket.id}
              className="mb-3 rounded-2xl border border-white/10 px-3 py-3"
              style={{ backgroundColor: cookTheme.surfaceElevated }}
            >
              <View className="flex-row items-center">
                {ticket.imageUrl ? (
                  <Image
                    source={{ uri: ticket.imageUrl }}
                    className="mr-3 h-14 w-14 rounded-xl bg-white/10"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="mr-3 h-14 w-14 items-center justify-center rounded-xl bg-white/10">
                    <Ionicons name="ticket-outline" size={22} color={cookTheme.textMuted} />
                  </View>
                )}
                <View className="min-w-0 flex-1 pr-3">
                  <Text className="text-[16px] text-white" style={{ fontFamily: 'Syne_700Bold' }}>
                    {ticket.label}
                  </Text>
                  {ticket.description ? (
                    <Text
                      className="mt-0.5 text-[12px]"
                      style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
                      numberOfLines={2}
                    >
                      {ticket.description}
                    </Text>
                  ) : null}
                  <Text
                    className="mt-1 text-[14px] text-white"
                    style={{ fontFamily: 'DMSans_600SemiBold' }}
                  >
                    ${ticket.price}
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => {
                  onAddTicket(ticket);
                  onClose();
                }}
                className="mt-3 flex-row items-center justify-center rounded-xl py-2.5"
                style={{ backgroundColor: cookTheme.accent }}
              >
                <Ionicons name="ticket-outline" size={16} color="#fff" />
                <Text className="ml-2 text-[14px] text-white" style={{ fontFamily: 'DMSans_600SemiBold' }}>
                  Buy ticket
                </Text>
              </Pressable>
            </View>
          ))}

          <View className="mt-1 flex-row items-start gap-2 rounded-xl bg-white/5 px-3 py-2.5">
            <Ionicons name="videocam-outline" size={16} color={cookTheme.accentSoft} />
            <Text
              className="flex-1 text-[12px] leading-4"
              style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
            >
              Tickets unlock the live stream so you can watch your food being cooked in real time. After checkout, tap Join live from My Tickets.
            </Text>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
