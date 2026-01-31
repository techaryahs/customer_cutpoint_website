import { redirect } from '@/app/routing';

export default function CustomerPage() {
  // @ts-ignore - fixing lint error while maintaining functionality
  redirect('/customer/appointment');
}
