function needsFullNameUpdate(data: any) {
  return (
    data.firstName !== undefined ||
    data.middleName !== undefined ||
    data.lastName !== undefined
  );
}

function constructFullName(data: any) {
  const { firstName, middleName, lastName } = data;
  if (firstName || middleName || lastName) {
    return [firstName || '', middleName || '', lastName || '']
      .filter(Boolean)
      .join(' ')
      .trim();
  }
  return '';
}

function constructFullNameWithCurrent(data: any, current: any) {
  const firstName =
    data.firstName !== undefined ? data.firstName : current.firstName;
  const middleName =
    data.middleName !== undefined ? data.middleName : current.middleName;
  const lastName =
    data.lastName !== undefined ? data.lastName : current.lastName;

  return [firstName || '', middleName || '', lastName || '']
    .filter(Boolean)
    .join(' ')
    .trim();
}

export const nameHelpers = {
  needsFullNameUpdate,
  constructFullName,
  constructFullNameWithCurrent,
};
