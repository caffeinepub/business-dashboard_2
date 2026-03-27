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
    mustChangePassword: IDL.Bool,
  });
  const EmployeeInfo = IDL.Record({
    id: IDL.Nat,
    name: IDL.Text,
    phone: IDL.Text,
    role: IDL.Text,
    salary: IDL.Nat,
  });
  const InquiryStatus = IDL.Variant({
    new_: IDL.Null,
    followUp: IDL.Null,
    closed: IDL.Null,
  });
  const InquiryInfo = IDL.Record({
    id: IDL.Nat,
    name: IDL.Text,
    phone: IDL.Text,
    requirement: IDL.Text,
    status: InquiryStatus,
    createdAt: IDL.Int,
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
    listEmployees: IDL.Func([IDL.Text, IDL.Text], [IDL.Vec(EmployeeInfo)], ['query']),
    addEmployee: IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Nat], [IDL.Nat], []),
    updateEmployee: IDL.Func([IDL.Text, IDL.Text, IDL.Nat, IDL.Text, IDL.Text, IDL.Text, IDL.Nat], [], []),
    deleteEmployee: IDL.Func([IDL.Text, IDL.Text, IDL.Nat], [], []),
    listInquiries: IDL.Func([IDL.Text, IDL.Text], [IDL.Vec(InquiryInfo)], ['query']),
    addInquiry: IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text], [IDL.Nat], []),
    updateInquiryStatus: IDL.Func([IDL.Text, IDL.Text, IDL.Nat, InquiryStatus], [], []),
    deleteInquiry: IDL.Func([IDL.Text, IDL.Text, IDL.Nat], [], []),
  });
};
export const init = ({ IDL }) => { return []; };
