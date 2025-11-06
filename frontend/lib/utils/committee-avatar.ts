/**
 * Generate a default DiceBear avatar for a committee
 * Uses the committee name as a seed for consistent pattern generation
 */
export const generateCommitteeAvatar = (committeeName: string, style: string = 'shapes') => {
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(committeeName)}`;
};

/**
 * Get the committee picture, falling back to a generated pattern if no picture is set
 */
export const getCommitteePicture = (committee: { name: string; picture?: string }) => {
  return committee.picture || generateCommitteeAvatar(committee.name);
};
