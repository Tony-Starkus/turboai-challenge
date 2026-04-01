'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';

import { getErrorMessage, loginUser } from '@/lib/api';
import { normalizeApiError } from '@/lib/api-error';
import { useSessionSync } from '@/hooks/use-session-sync';
import { Button } from '@/components/Button';
import TextField from '@/components/form/TextField';
import Image from 'next/image';
import EyeOffIcon from '@/components/icons/EyeOffIcon';
import EyeIcon from '@/components/icons/EyeIcon';

type FormValues = {
  email: string;
  password: string;
};

const schema = yup
  .object({
    email: yup.string().email('Enter a valid email').required('Email is required'),
    password: yup.string().required('Password is required'),
  })
  .required();

export default function LoginPage() {
  const router = useRouter();
  const syncSession = useSessionSync();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isRouting, startRouting] = useTransition();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: FormValues) => {
    setAuthError(null);

    try {
      const nextSession = await loginUser(data);
      syncSession(nextSession);
      startRouting(() => router.replace('/'));
    } catch (err) {
      const apiErr = normalizeApiError(err);

      if (apiErr.status === 400 && apiErr.details && typeof apiErr.details === 'object') {
        const details = apiErr.details as Record<string, unknown>;
        let nonFieldMessage = '';

        Object.entries(details).forEach(([field, value]) => {
          const message = Array.isArray(value) ? value.join(' ') : String(value);

          if (field === 'email' || field === 'password') {
            setError(field as keyof FormValues, { type: 'server', message });
          } else {
            nonFieldMessage += `${message} `;
          }
        });

        if (nonFieldMessage.trim()) {
          setAuthError(nonFieldMessage.trim());
        }
      } else {
        setAuthError(getErrorMessage(apiErr));
      }
    }
  };

  return (
    <div className="app-shell">
      <main className="min-h-screen flex items-center justify-center px-4 py-5">
        <section className="w-full max-w-lg rounded-[36px] p-6 md:p-8">
          <div className="mx-auto w-full max-w-md">
            <Image src="/assets/images/cactus.png" className="block m-auto" alt="Cat" width={95} height={113} />

            <h1 className="text-3xl pt-10 font-semibold uppercase tracking-[0.24em] text-ink-soft text-center">
              Yay, You&apos;re Back!
            </h1>

            {authError ? (
              <div className="mt-5 rounded-[22px] border border-[rgba(167,77,45,0.18)] bg-[rgba(239,156,102,0.16)] px-4 py-3 text-sm leading-6 text-ink">
                {authError}
              </div>
            ) : null}

            <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
              <div>
                <TextField
                  id="email"
                  type="email"
                  placeholder="Email address"
                  {...register('email')}
                  error={!!errors.email}
                />
                {errors.email?.message ? <p className="mt-1 text-sm text-red-500">{errors.email.message}</p> : null}
              </div>

              <div>
                <TextField
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  {...register('password')}
                  error={!!errors.password}
                  iconRight={
                    <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="cursor-pointer">
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  }
                />
                {errors.password?.message ? (
                  <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
                ) : null}
              </div>

              <Button fullWidth disabled={isSubmitting || isRouting}>
                {isSubmitting ? 'Logging in...' : 'Login'}
              </Button>
              <Link href="/register" className="block! m-auto w-fit text-caramel! hover:underline!">
                Oops! I&apos;ve never been here before
              </Link>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
