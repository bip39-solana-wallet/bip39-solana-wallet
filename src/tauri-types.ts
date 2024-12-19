export type UserInfo =
  | 'None'
  | 'Locked'
  | {
      Unlocked: {
        public_key: string;
        balance: number;
        balance_readable: number;
      };
      None: undefined;
      Locked: undefined;
      Unavailable: undefined;
      Invalid: undefined;
    }
  | 'Unavailable'
  | 'Invalid';

export type get_user_info_args = undefined;
export type get_user_info_return = UserInfo;

export type generate_words_args = undefined;
export type generate_words_return = string[];

export type generate_wallet_args = {
  words: string[];
  password: string;
};
export type generate_wallet_return = UserInfo | null;

export type unlock_wallet_args = {
  password: string;
};
export type unlock_wallet_return = UserInfo | null;

export type refresh_user_args = undefined;
export type refresh_user_return = UserInfo | null;

export type send_sol_args = {
  address: string;
  amount: number;
};
export type send_sol_return = UserInfo;

type Keys =
  | 'get_user_info'
  | 'generate_words'
  | 'generate_wallet'
  | 'unlock_wallet'
  | 'refresh_user'
  | 'send_sol';
type FunctionArgs<K extends Keys> = K extends 'get_user_info'
  ? get_user_info_args
  : K extends 'generate_words'
  ? generate_words_args
  : K extends 'generate_wallet'
  ? generate_wallet_args
  : K extends 'unlock_wallet'
  ? unlock_wallet_args
  : K extends 'refresh_user'
  ? refresh_user_args
  : K extends 'send_sol'
  ? send_sol_args
  : never;
type FunctionRet<K extends Keys> = K extends 'get_user_info'
  ? get_user_info_return
  : K extends 'generate_words'
  ? generate_words_return
  : K extends 'generate_wallet'
  ? generate_wallet_return
  : K extends 'unlock_wallet'
  ? unlock_wallet_return
  : K extends 'refresh_user'
  ? refresh_user_return
  : K extends 'send_sol'
  ? send_sol_return
  : never;

import { invoke as tauriInvoke } from '@tauri-apps/api/core';

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export async function invoke<K extends Keys>(
  cmd: K,
  args: Prettify<FunctionArgs<K>>
): Promise<Prettify<FunctionRet<K>>> {
  return tauriInvoke(cmd, args);
}
