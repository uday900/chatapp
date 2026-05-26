export function filterAvailableMembers(members, query) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return members;

  return members.filter((member) => {
    const fullName = (member.full_name || "").toLowerCase();
    const mobile = (member.mobile || member.mobile_number || "").toLowerCase();
    return (
      fullName.includes(normalizedQuery) ||
      mobile.includes(normalizedQuery)
    );
  });
}

export function getMemberBadgeText(member) {
  return member?.alreadyInGroup ? "Already added to the group" : "Add";
}
