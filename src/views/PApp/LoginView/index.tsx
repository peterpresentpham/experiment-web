/* eslint-disable react/no-unescaped-entities */
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import PAppGoogleButton from 'src/components/buttons/GoogleButton/PAppGoogleButton';
import BaseAuthorForm from 'src/components/form/BaseAuthorForm';
import { Button } from 'src/components/shadcn/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from 'src/components/shadcn/form';
import { Input, PasswordInput } from 'src/components/shadcn/input';
import { usePasswordLogin } from 'src/queries/papp/auth.query';
import { getAxiosError } from 'src/services';
import { useAuthStore } from 'src/states/auth.state';
import z from 'zod';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const loginSchema = z.object({
  name: z.string('Please enter a valid email of username'),
  password: z.string('Please enter password'),
});

type TFormValues = z.infer<typeof loginSchema>;

type TProps = {
  redirect?: string;
};

export default function LoginView({ redirect }: TProps) {
  const router = useRouter();
  const { fn } = useAuthStore();

  const form = useForm<TFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { name: '', password: '' },
  });

  const mutation = usePasswordLogin({
    onSuccess: (data) => {
      form.reset();
      fn.setAccessToken(data.accessToken);
      toast.success('Login successfully!');
      if (redirect) router.push(redirect);
      else router.push('/papp');
    },
    onError: (error) => {
      toast.error(getAxiosError(error) || 'Failed to login!');
    },
  });

  async function onSubmit(values: TFormValues) {
    if (emailRegex.test(values.name)) {
      mutation.mutate({ email: values.name, password: values.password });
    } else mutation.mutate({ name: values.name, password: values.password });
  }

  return (
    <BaseAuthorForm form={form} title="Sign in" description="Access your account">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email or Username</FormLabel>
              <FormControl>
                <Input type="text" placeholder="Email or Username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="mt-4">
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="mt-2 flex items-center justify-end">
          <Link href="/app/forgot-password">
            <p className="text-sm font-semibold">Forgot password?</p>
          </Link>
        </div>
        <Button
          type="submit"
          isLoading={mutation.isPending}
          loadingText="Loading..."
          className="mt-4 h-9 w-full"
        >
          Sign in
        </Button>
      </form>
      <div className="relative mt-6 flex items-center">
        <div className="bg-popover absolute top-1/2 left-1/2 -translate-1/2 px-4">
          <p className="text-sm text-[#6C7278]">or link via email</p>
        </div>
        <div className="h-px w-full bg-[#FFFFFF1F]" />
      </div>
      <PAppGoogleButton className="mt-5" />
      <p className="text-muted-foreground mt-4 text-center text-sm">
        Don't have an account?{' '}
        <Link href="/papp/signup">
          <span className="text-special font-semibold">Create an account</span>
        </Link>
      </p>
    </BaseAuthorForm>
  );
}
