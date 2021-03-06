declare interface IUserDirectoryWebPartStrings {
  // Pages  
  PageGeneralDescription: string;
  PageColumnsDescription: string;
  // Groups
  GroupDataSource: string;
  GroupAppearance: string;
  GroupColumns: string;
  GroupSearchBox: string;
  // Labels
  ApiLabel: string;
  ApplyApiButton: string;
  ApiHelp1: string;
  ApiHelp2: string;
  CompactModeLabel: string;
  CompactModeOn: string;
  CompactModeOff: string;
  AlternateColoursLabel: string;
  AlternateColoursOn: string;
  AlternateColoursOff: string;
  UseBuiltInSearchLabel: string;
  UseBuiltInSearchOn: string;
  UseBuiltInSearchOff: string;
  SearchBoxPlaceholderLabel: string;
  DefaultSearchPlaceholder: string;
  SearchBoxHelpLabel: string;
  CustomHeaderPlaceholder: string;
  BtnResetText: string;
  // Column headers
  ColPhoto: string;
  ColName: string;
  ColJobTitle: string;
  ColDepartment: string;
  ColOfficeLocation: string;
  ColCity: string;
  ColPhone: string;
  ColMail: string;
  // Web part contents
  SearchBoxLabel: string;
  BadApi1: string;
  BadApi2: string;
  NoUsers: string;
}

declare module 'UserDirectoryWebPartStrings' {
  const strings: IUserDirectoryWebPartStrings;
  export = strings;
}
