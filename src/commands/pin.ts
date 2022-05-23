import {
  DMChannel,
  GuildMember,
  type MessageContextMenuInteraction,
} from 'discord.js'
import { ContextMenu, Discord } from 'discordx'

@Discord()
export abstract class Pin {
  @ContextMenu('MESSAGE', 'Pin / Unpin')
  public async messageHandler(interaction: MessageContextMenuInteraction) {
    const channel = interaction.channel!
    if (channel instanceof DMChannel || channel.partial) {
      await interaction.reply({
        content: 'This cannot be run in DMs!',
        ephemeral: true,
      })

      return
    }

    const member = interaction.member!
    if (!(member instanceof GuildMember)) {
      await interaction.reply({
        content: 'Failed to resolve interaction member!',
        ephemeral: true,
      })

      return
    }

    const permissions = member.permissionsIn(channel)
    if (!permissions.has('VIEW_CHANNEL') || !permissions.has('SEND_MESSAGES')) {
      await interaction.reply({
        content: 'You do not have permission to manage pins in this channel!',
        ephemeral: true,
      })

      return
    }

    const message = await interaction.channel?.messages.fetch(
      interaction.targetMessage.id
    )

    if (message === undefined) {
      await interaction.reply({
        content: 'Failed to find message!',
        ephemeral: true,
      })

      return
    }

    try {
      const action = message.pinned ? 'Unpinned' : 'Pinned'
      await (message.pinned ? message.unpin() : message.pin())

      await interaction.reply({
        content: `${action} message.`,
      })
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error)
      }

      const action = message.pinned ? 'unpin' : 'pin'
      await interaction.reply({
        content: `Failed to ${action} message!\nCheck permissions and pin limit.`,
        ephemeral: true,
      })
    }
  }
}