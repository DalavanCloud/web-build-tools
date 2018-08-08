// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.

import { CommandLineFlagParameter } from '@microsoft/ts-command-line';

import { BaseInstallAction } from './BaseInstallAction';
import { IInstallManagerOptions } from '../../logic/InstallManager';
import { RushCommandLineParser } from '../RushCommandLineParser';

export class UpdateAction extends BaseInstallAction {
  private _fullParameter: CommandLineFlagParameter;
  private _recheckParameter: CommandLineFlagParameter;
  private _skipInstallParameter: CommandLineFlagParameter;

  constructor(parser: RushCommandLineParser) {
    super({
      actionName: 'update',
      summary: 'Install package dependencies for all projects in the repo,'
        + ' and create or update the shrinkwrap file as needed',
      documentation: 'The "rush update" command installs the dependencies described in your'
        + ' package.json files, and updates the shrinkwrap file as needed.'
        + ' (This "shrinkwrap" file stores a central inventory of all dependencies and versions'
        + ' for projects in your repo. It is found in the "common/config/rush" folder.)'
        + ' Note that Rush always performs a single install for all projects in your repo.'
        + ' You should run "rush update" whenever you start working in a Rush repo,'
        + ' after you pull from Git, and after you modify a package.json file.'
        + ' If there is nothing to do, "rush update" is instantaneous.'
        + ' NOTE: In certain cases "rush install" should be used instead of "rush update"'
        + ' -- for details, see the command help for "rush install".',
      parser
    });
  }

  protected onDefineParameters(): void {
    super.onDefineParameters();

    this._fullParameter = this.defineFlagParameter({
      parameterLongName: '--full',
      description: 'Normally "rush update" tries to preserve your existing installed versions'
        + ' and only makes the minimum updates needed to satisfy the package.json files.'
        + ' This conservative approach prevents your PR from getting involved with package updates that'
        + ' are unrelated to your work. Use "--full" when you really want to update all dependencies'
        + ' to the latest SemVer-compatible version.  This should be done periodically by a person'
        + ' or robot whose role is to deal with potential upgrade regressions.'
    });
    this._recheckParameter = this.defineFlagParameter({
      parameterLongName: '--recheck',
      description: 'If the shrinkwrap file appears to already satisfy the package.json files,'
        + ' then "rush update" will skip invoking the package manager at all.  In certain situations'
        + ' this heuristic may be inaccurate.  Use the "--recheck" flag to force the package manager'
        + ' to process the shrinkwrap file.  This will also update your shrinkwrap file with Rush\'s fixups.'
        + ' (To minimize shrinkwrap churn, these fixups are normally performed only in the temporary folder.)'
    });

    this._skipInstallParameter = this.defineFlagParameter({
      parameterLongName: '--skip-install',
      description: '(PNPM only) Updates the shrinkwrap file, but doesn\'t perform an installation.'
        + ' Useful in certain cases where you only need changes to a shrinkwrap, but don\'t want to'
        + ' tie up your disk or computer doing an install, e.g. if you are merging from master but'
        + ' are not planning on doing a local installation.'
    });
  }

  protected run(): Promise<void> {
    if (this._skipInstallParameter.value && this.rushConfiguration.packageManager !== 'pnpm') {
      return Promise.reject(`The --skip-install flag only works when using PNPM.`);
    }

    return super.run();
  }

  protected buildInstallOptions(): IInstallManagerOptions {
    return {
      allowShrinkwrapUpdates: true,
      bypassPolicy: this._bypassPolicyParameter.value!,
      noLink: this._noLinkParameter.value! || this._skipInstallParameter.value,
      fullUpgrade: this._fullParameter.value!,
      recheckShrinkwrap: this._recheckParameter.value!,
      collectLogFile: this._debugPackageManagerParameter.value!,
      skipInstall: this._skipInstallParameter.value
    };
  }
}
