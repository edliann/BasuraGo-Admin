export function createRiderInvitationLink(
  invitationId: string,
  invitationToken: string,
): string {
  const params = new URLSearchParams({
    invitationId,
    invitationToken,
  });

  return `basurago://invitation?${params.toString()}`;
}