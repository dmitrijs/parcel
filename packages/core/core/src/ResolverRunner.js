// @flow

import type {ParcelOptions, Dependency, AssetRequest} from '@parcel/types';
import path from 'path';
import type ParcelConfig from './ParcelConfig';
import {report} from './ReporterRunner';

type Opts = {|
  config: ParcelConfig,
  options: ParcelOptions
|};

export default class ResolverRunner {
  config: ParcelConfig;
  options: ParcelOptions;

  constructor({config, options}: Opts) {
    this.config = config;
    this.options = options;
  }

  async resolve(dependency: Dependency): Promise<AssetRequest> {
    report({
      type: 'buildProgress',
      phase: 'resolving',
      dependency
    });

    let resolvers = await this.config.getResolvers();

    for (let resolver of resolvers) {
      let result = await resolver.resolve({dependency, options: this.options});

      if (result) {
        return result;
      }
    }

    let dir = dependency.sourcePath
      ? path.dirname(dependency.sourcePath)
      : '<none>';
    let err = new Error(
      `Cannot find module '${dependency.moduleSpecifier}' from '${dir}'`
    );

    (err: any).code = 'MODULE_NOT_FOUND';
    throw err;
  }
}