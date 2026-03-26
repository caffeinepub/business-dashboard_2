export const idlFactory = ({ IDL }) => {
  const UserRole = IDL.Variant({
    superAdmin: IDL.Null,
    admin: IDL.Null,
    dataOperator: IDL.Null,
    employee: IDL.Null,
  });
  const UserInfo = IDL.Record({
    username: IDL.Text,
    name: IDL.Text,
    phone: IDL.Text,
    role: UserRole,
  });
  return IDL.Service({
    authenticate: IDL.Func([IDL.Text, IDL.Text], [IDL.Opt(UserInfo)], ['query']),
    listUsers: IDL.Func([IDL.Text, IDL.Text], [IDL.Vec(UserInfo)], ['query']),
    createUser: IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, UserRole], [], []),
    updateUser: IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, UserRole], [], []),
    deleteUser: IDL.Func([IDL.Text, IDL.Text, IDL.Text], [], []),
    changePassword: IDL.Func([IDL.Text, IDL.Text, IDL.Text], [], []),
    resetPassword: IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text], [], []),
    initializeDefaults: IDL.Func([], [], []),
  });
};
export const init = ({ IDL }) => { return []; };
