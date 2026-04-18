'use client';

import Link from 'next/link';
import {
  useParams as useNextParams,
  usePathname,
  useRouter,
  useSearchParams,
} from 'next/navigation';
import {
  AnchorHTMLAttributes,
  ForwardedRef,
  PropsWithChildren,
  ReactNode,
  forwardRef,
} from 'react';

type NavigateOptions = { replace?: boolean };

type CompatLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  to: string;
};

export const BrowserRouter = ({ children }: PropsWithChildren) => <>{children}</>;
export const Routes = ({ children }: PropsWithChildren) => <>{children}</>;
export const Route = ({ element }: { element: ReactNode }) => <>{element}</>;

export function useNavigate() {
  const router = useRouter();

  return (to: string | number, options?: NavigateOptions) => {
    if (typeof to === 'number') {
      if (to < 0) {
        router.back();
      }
      return;
    }
    if (options?.replace) {
      router.replace(to);
      return;
    }
    router.push(to);
  };
}

export function useParams<T extends Record<string, string>>() {
  return useNextParams() as T;
}

export function useLocation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams?.toString() || '';

  return {
    pathname,
    search: search ? `?${search}` : '',
    hash: '',
    state: null,
    key: pathname,
  };
}

export const LinkCompat = forwardRef(function LinkCompat(
  { to, children, ...props }: CompatLinkProps,
  ref: ForwardedRef<HTMLAnchorElement>
) {
  return (
    <Link href={to} ref={ref} {...props}>
      {children}
    </Link>
  );
});

export type NavLinkProps = CompatLinkProps & {
  className?: any;
};

export const NavLink = forwardRef(function NavLink(
  { to, className, children, ...props }: NavLinkProps,
  ref: ForwardedRef<HTMLAnchorElement>
) {
  const pathname = usePathname();
  const isActive = pathname === to;
  const computedClassName = typeof className === 'function'
    ? className({ isActive, isPending: false })
    : className;

  return (
    <Link href={to} ref={ref} className={computedClassName} {...props}>
      {children}
    </Link>
  );
});

export { LinkCompat as Link };

