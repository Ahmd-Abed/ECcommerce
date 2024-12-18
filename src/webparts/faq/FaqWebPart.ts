import * as React from "react";
import * as ReactDom from "react-dom";
import { Version } from "@microsoft/sp-core-library";
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField,
} from "@microsoft/sp-property-pane";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";

import * as strings from "FaqWebPartStrings";
import { IFaqProps } from "./components/IFaqProps";

import { PropertyFieldListPickerOrderBy } from "@pnp/spfx-property-controls/lib/PropertyFieldListPicker";
import App from "./mainConfiguration";
import app from "../../authFirebaseConfig";
<<<<<<< HEAD

=======
>>>>>>> ahmad
export interface IFaqWebPartProps {
  description: string;
  list: string;
  title: string;
}

export default class FaqWebPart extends BaseClientSideWebPart<IFaqWebPartProps> {
  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = "";

  public render(): void {
    app;
    const element: React.ReactElement<IFaqProps> = React.createElement(App, {
      description: this.properties.description,
      isDarkTheme: this._isDarkTheme,
      environmentMessage: this._environmentMessage,
      hasTeamsContext: !!this.context.sdks.microsoftTeams,
      userDisplayName: this.context.pageContext.user.displayName,

      //added
      context: this.context,
      listGuid: this.properties.list,
      title: this.properties.title,
      displayMode: this.displayMode,
      updateProperty: (value: string) => {
        this.properties.title = value;
      },
    });

    ReactDom.render(element, this.domElement);
  }

  protected async onInit(): Promise<void> {
    const message = await this._getEnvironmentMessage();
    this._environmentMessage = message;
  }

  private async _getEnvironmentMessage(): Promise<string> {
    if (!!this.context.sdks.microsoftTeams) {
      // running in Teams, office.com or Outlook
      const context =
        await this.context.sdks.microsoftTeams.teamsJs.app.getContext();
      let environmentMessage: string = "";
      switch (context.app.host.name) {
        case "Office": // running in Office
          environmentMessage = this.context.isServedFromLocalhost
            ? strings.AppLocalEnvironmentOffice
            : strings.AppOfficeEnvironment;
          break;
        case "Outlook": // running in Outlook
          environmentMessage = this.context.isServedFromLocalhost
            ? strings.AppLocalEnvironmentOutlook
            : strings.AppOutlookEnvironment;
          break;
        case "Teams": // running in Teams
        case "TeamsModern":
          environmentMessage = this.context.isServedFromLocalhost
            ? strings.AppLocalEnvironmentTeams
            : strings.AppTeamsTabEnvironment;
          break;
        default:
          environmentMessage = strings.UnknownEnvironment;
      }
      return environmentMessage;
    }

    return Promise.resolve(
      this.context.isServedFromLocalhost
        ? strings.AppLocalEnvironmentSharePoint
        : strings.AppSharePointEnvironment
    );
  }

  // protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
  //   if (!currentTheme) {
  //     return;
  //   }

  //   this._isDarkTheme = !!currentTheme.isInverted;
  //   const { semanticColors } = currentTheme;

  //   if (semanticColors) {
  //     this.domElement.style.setProperty(
  //       "--bodyText",
  //       semanticColors.bodyText || null
  //     );
  //     this.domElement.style.setProperty("--link", semanticColors.link || null);
  //     this.domElement.style.setProperty(
  //       "--linkHovered",
  //       semanticColors.linkHovered || null
  //     );
  //   }
  // }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse("1.0");
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription,
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField("description", {
                  label: strings.DescriptionFieldLabel,
                }),

                //added
                PropertyFieldListPicker("list", {
                  label: "Select a list",
                  selectedList: this.properties.list,
                  includeHidden: false,
                  orderBy: PropertyFieldListPickerOrderBy.Title,
                  disabled: false,
                  onPropertyChange: this.onPropertyPaneFieldChanged.bind(this),
                  properties: this.properties,
                  context: this.context as any,
                  onGetErrorMessage: null,
                  deferredValidationTime: 0,
                  key: "listPickerFieldId",
                }),
              ],
            },
          ],
        },
      ],
    };
  }
}
function PropertyFieldListPicker(
  arg0: string,
  arg1: {
    label: string;
    selectedList: string;
    includeHidden: boolean;
    orderBy: any;
    disabled: boolean;
    onPropertyChange: any;
    properties: IFaqWebPartProps;
    context: any;
    onGetErrorMessage: null;
    deferredValidationTime: number;
    key: string;
  }
): import("@microsoft/sp-property-pane").IPropertyPaneField<any> {
  throw new Error("Function not implemented.");
}
