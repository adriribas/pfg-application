const updateGroups = async (subject, currentGroups, type, newAmount, transaction) => {
  const groups = currentGroups.filter(group => group.type === type);

  if (groups.length < newAmount) {
    for (let i = groups.length + 1; i <= newAmount; i++) {
      const groupData = { type, number: i };
      await subject.createGroup(groupData, { transaction });
    }
  } else if (groups.length > newAmount) {
    for (let i = groups.length - 1; i >= newAmount; i--) {
      await groups[i].destroy({ transaction });
    }
  }
};

export const syncSubjectGroups = async (subject, transaction) => {
  const currentGroups = await subject.getGroups({ transaction });

  await Promise.all([
    updateGroups(subject, currentGroups, 'small', subject.smallGroups, transaction),
    updateGroups(subject, currentGroups, 'medium', subject.mediumGroups, transaction),
    updateGroups(subject, currentGroups, 'big', subject.bigGroups, transaction)
  ]);
};
