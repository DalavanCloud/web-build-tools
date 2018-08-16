import { RushConfiguration } from './RushConfiguration';
import { RushConfigurationProject } from './RushConfigurationProject';
import { ChangeFile } from './ChangeFile';
import { IChangeFile } from './ChangeManagement';

/**
 * @public
 * A class that helps with programatically interacting with Rush's change files.
 */
export class ChangeManager {
  /**
   * Creates a change file that has a 'none' type.
   * @param rushConfiguration The rush configuration we are working with
   * @param projectName The name of the project for which to create a change file
   * @param emailAddress The email address which should be associated with this change
   */
  public static createEmptyChangeFiles(
    rushConfiguration: RushConfiguration,
    projectName: string,
    emailAddress: string): string | undefined {
    const projectInfo: RushConfigurationProject | undefined = rushConfiguration.getProjectByName(projectName);
    if (projectInfo && projectInfo.shouldPublish) {

      const changefile: IChangeFile = { // tslint:disable-line:no-any
        'changes': [{
          comment: '',
          packageName: projectName,
          type: 'none'
        }],
        'packageName': projectName,
        'email': emailAddress
      };

      return new ChangeFile(changefile, rushConfiguration).writeSync();
    }
    return undefined;
  }
}