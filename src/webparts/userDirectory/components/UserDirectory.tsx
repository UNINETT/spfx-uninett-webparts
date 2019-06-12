import * as React from 'react';
import styles from './UserDirectory.module.scss';
import * as strings from 'UserDirectoryWebPartStrings';
import { IUserDirectoryProps } from './IUserDirectoryProps';
import { IUserDirectoryState } from './IUserDirectoryState';
import { IUserItem } from './IUserItem';

import { escape } from '@microsoft/sp-lodash-subset';

import { MSGraphClient } from "@microsoft/sp-http";

import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import { Fabric } from 'office-ui-fabric-react/lib/Fabric';
import { DetailsList, DetailsListLayoutMode, Selection, SelectionMode, IColumn, ConstrainMode } from 'office-ui-fabric-react/lib/DetailsList';
import { MarqueeSelection } from 'office-ui-fabric-react/lib/MarqueeSelection';
import { mergeStyleSets } from 'office-ui-fabric-react/lib/Styling';

const classNames = mergeStyleSets({
  controlWrapper: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  exampleToggle: {
    display: 'inline-block',
    marginBottom: '10px',
    marginRight: '30px'
  },
  selectionDetails: {
    marginBottom: '20px'
  }
});
const controlStyles = {
  root: {
    margin: '0 30px 20px 0',
    maxWidth: '300px'
  }
};

export default class UserDirectory extends React.Component<IUserDirectoryProps, IUserDirectoryState> {

  private _selection: Selection;  
  private _allUsers: IUserItem[];
  
  constructor(props: IUserDirectoryProps, state: IUserDirectoryState) {
    super(props);
    this._allUsers = this._search();
    console.log("Number of users: " + this._allUsers.length);

    const columns: IColumn[] = [
      {
        key: 'colName',
        name: 'Name',
        fieldName: 'displayName',
        minWidth: 180,
        maxWidth: 190,
        //isRowHeader: true,
        //isSorted: true,
        //isSortedDescending: false,
        sortAscendingAriaLabel: 'Sorted A to Z',
        sortDescendingAriaLabel: 'Sorted Z to A',
        onColumnClick: this._onColumnClick,
        data: 'string',
        isPadded: true
      },
      {
        key: 'colTitle',
        name: 'Job Title',
        fieldName: 'jobTitle',
        minWidth: 70,
        maxWidth: 90,
        onColumnClick: this._onColumnClick,
        data: 'string',
        isPadded: true
      },
      {
        key: 'colMail',
        name: 'Mail',
        fieldName: 'mail',
        minWidth: 150,
        maxWidth: 160,
        isCollapsible: false,
        data: 'string',
        onColumnClick: this._onColumnClick,
        isPadded: true
      },
      {
        key: 'colPhone',
        name: 'Mobile phone',
        fieldName: 'mobilePhone',
        minWidth: 70,
        maxWidth: 90,        
        data: 'string',
        //onColumnClick: this._onColumnClick
      }
    ];

    this._selection = new Selection({
      onSelectionChanged: () => {
        this.setState({
          selectionDetails: this._getSelectionDetails()
        });
      }
    });

    this.state = {
      users: this._allUsers,
      searchFor: "",
      columns: columns,
      selectionDetails: this._getSelectionDetails(),
      isModalSelection: false,
      isCompactMode: false
    };
  }

  public render(): React.ReactElement<IUserDirectoryProps> {

    const { columns, isCompactMode, users, selectionDetails, isModalSelection } = this.state;
    
    return (
      <Fabric>
        {/*
        <div className={classNames.controlWrapper}>
          <Toggle
            label="Enable compact mode"
            checked={isCompactMode}
            onChange={this._onChangeCompactMode}
            onText="Compact"
            offText="Normal"
            styles={controlStyles}
          />
          <Toggle
            label="Enable modal selection"
            checked={isModalSelection}
            onChange={this._onChangeModalSelection}
            onText="Modal"
            offText="Normal"
            styles={controlStyles}
          />
          <TextField label="Filter by name:" onChange={this._onChangeText} styles={controlStyles} />
        </div>
        <div className={classNames.selectionDetails}>{selectionDetails}</div>
        */}

        <div className={classNames.controlWrapper}>
          <TextField label="Filter by name:" onChange={this._onChangeText} styles={controlStyles} />
        </div>

        <MarqueeSelection selection={this._selection}>
          <DetailsList
            items={this.state.users}
            compact={isCompactMode}
            columns={columns}
            selectionMode={isModalSelection ? SelectionMode.multiple : SelectionMode.none}
            setKey="set"
            layoutMode={DetailsListLayoutMode.justified}
            isHeaderVisible={true}
            selection={this._selection}
            selectionPreservedOnEmptyClick={false}
            //onItemInvoked={this._onItemInvoked}
            enterModalSelectionOnTouch={true}
            ariaLabelForSelectionColumn="Toggle selection"
            ariaLabelForSelectAllCheckbox="Toggle selection for all items"
            constrainMode={ConstrainMode.unconstrained}
          />
        </MarqueeSelection>
      </Fabric>
    );
  }
  public componentDidUpdate(previousProps: any, previousState: IUserDirectoryState) {
    if (
      previousState.isModalSelection !== this.state.isModalSelection &&
      !this.state.isModalSelection
    ) {
      this._selection.setAllSelected(false);
    }
  }

  private _onChangeCompactMode = (ev: React.MouseEvent<HTMLElement>, checked: boolean): void => {
    this.setState({ isCompactMode: checked });
  }

  private _onChangeModalSelection = (ev: React.MouseEvent<HTMLElement>, checked: boolean): void => {
    this.setState({ isModalSelection: checked });
  }

  private _onChangeText = (
    ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    text: string
  ): void => {
    this.setState({
      users: text
        ? this._allUsers.filter(i => i.displayName.toLowerCase().indexOf(text) > -1)
        : this._allUsers
    });
  }

  private _onItemInvoked(item: any): void {
    alert(`Item invoked: ${item.name}`);
  }

  private _getSelectionDetails(): string {
    const selectionCount = this._selection.getSelectedCount();

    switch (selectionCount) {
      case 0:
        return 'No items selected';
      case 1:
        return '1 item selected: ' + (this._selection.getSelection()[0] as IUserItem).displayName;
      default:
        return `${selectionCount} items selected`;
    }
  }

  private _onColumnClick = (ev: React.MouseEvent<HTMLElement>, column: IColumn): void => {
    const { columns, users } = this.state;
    const newColumns: IColumn[] = columns.slice();
    const currColumn: IColumn = newColumns.filter(currCol => column.key === currCol.key)[0];
    newColumns.forEach((newCol: IColumn) => {
      if (newCol === currColumn) {
        currColumn.isSortedDescending = !currColumn.isSortedDescending;
        currColumn.isSorted = true;
      } else {
        newCol.isSorted = false;
        newCol.isSortedDescending = true;
      }
    });
    const newUsers = _copyAndSort(users, currColumn.fieldName!, currColumn.isSortedDescending);
    this.setState({
      columns: newColumns,
      users: newUsers
    });
  }

  private _search(): Array<IUserItem> {

    // Prepare the output array
    var users: Array<IUserItem> = new Array<IUserItem>();
    console.log("API: " + this.props.api);
    this.props.context.msGraphClientFactory
      .getClient()
      .then((client: MSGraphClient): void => {
        // From https://github.com/microsoftgraph/msgraph-sdk-javascript sample
        client
          .api(this.props.api)
          .version("v1.0")
          .select("displayName,jobTitle,mail,mobilePhone")
          .get((err, res) => {  
  
            if (err) {
              console.error(err);
              return;
            }            
  
            // Map the JSON response to the output array
            res.value.map((item: any) => {
              users.push( { 
                displayName: item.displayName,
                jobTitle: item.jobTitle,
                mail: item.mail,
                mobilePhone: item.mobilePhone                
              });
            });
  
            // Update the component state accordingly to the result
            this.setState(
              {
                users: users,
              }
            );
            console.log("Number of users: " + this._allUsers.length);
          });
      });

      return users;
  }
}

function _copyAndSort<T>(items: T[], columnKey: string, isSortedDescending?: boolean): T[] {
  const key = columnKey as keyof T;
  return items
    .slice(0)
    .sort((a: T, b: T) => ((isSortedDescending ? a[key] < b[key] : a[key] > b[key]) ? 1 : -1));
}