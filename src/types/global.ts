import { DefaultError, UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';
import { AxiosRequestConfig } from 'axios';
import { LucideProps } from 'lucide-react';
import { ComponentProps, RefAttributes } from 'react';

export type TTheme = 'light' | 'dark';
export type TPosition = [number, number]; // expect [row, column]
export type TVector = TPosition; // expect [x, y]

export enum TSound {
  CLICK = 'click',
  MOVE = 'move',
  SUCCESS = 'success',
  ERROR = 'error',
  BACKGROUND = 'background',
}

export type TSoundConfigType = {
  type: TSound;
  loop?: boolean;
  volume?: number;
  isEnabled?: boolean;
};

export type TIconProps = Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>;

export enum ENV_TYPE {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
}

export interface TAnimationComponentProps {
  size?: number | string;
  color?: string;
}

export interface TAnimationComponentDivProps<
  T = TAnimationComponentProps,
> extends ComponentProps<'div'> {
  iconProps?: T;
}

export type TOptionalQuery<T = unknown> = Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>;

export type TJson =
  | string
  | number
  | Array<string>
  | Array<number>
  | { [index: string | number]: TJson };

export type TPageMetadata = Partial<{
  title: string;
  description: string;
  url: string;
  siteName: string;
  twitterHandle: string;
  icon: string;
  image: string;
  keywords: string;
}>;

export type TMutationOptionsWithoutFn<
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TOnMutateResult = unknown,
> = Omit<UseMutationOptions<TData, TError, TVariables, TOnMutateResult>, 'mutationFn'>;

export type TMutationOptionsDefaultError<
  TData = unknown,
  TVariables = void,
  TOnMutateResult = unknown,
> = TMutationOptionsWithoutFn<TData, Error, TVariables, TOnMutateResult>;

export type TBaseQueryInstance = {
  get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T = unknown, B = unknown>(url: string, data?: B, config?: AxiosRequestConfig): Promise<T>;
  put<T = unknown, B = unknown>(url: string, data?: B, config?: AxiosRequestConfig): Promise<T>;
  delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>;
};

export type TPagination = {
  page?: number;
  limit?: number;
};

export type TPaginationResponse = {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
};
