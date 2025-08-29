// TEMPORARILY DISABLED DUE TO BUILD ERRORS - WILL BE FIXED IN FUTURE UPDATE
// This file contains ARC-0059 typed client implementation that needs type fixes

import * as algokit from '@algorandfoundation/algokit-utils';
import algosdk from 'algosdk';
import { Arc59Client } from './arc59/client';

// Disabled until type issues are resolved
export async function sendSizViaArc59Typed(params: any): Promise<any> {
  console.log('ARC-0059 typed client implementation temporarily disabled');
  return null;
}

export async function claimSizFromArc59InboxTyped(
  algorand: algokit.AlgorandClient,
  receiver: string,
  assetId: bigint
): Promise<any> {
  console.log('ARC-0059 typed client claim function temporarily disabled');
  return null;
}

export async function getArc59InboxAddressTyped(
  algorand: algokit.AlgorandClient,
  receiver: string
): Promise<string> {
  console.log('ARC-0059 typed client inbox address function temporarily disabled');
  return '';
}
