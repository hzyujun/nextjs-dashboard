'use server';

import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
  console.log('test...createInvoice %o', { formData });

  // const rawFormData = {
  //   customerId: formData.get('customerId'),
  //   amount: formData.get('amount'),
  //   status: formData.get('status'),
  // };

  const rawFormData = Object.fromEntries(formData.entries());

  const { customerId, amount, status } = CreateInvoice.parse(rawFormData);

  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  // Test it out:
  console.log({ rawFormData, amountInCents, date });

  await sql`
  INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `;

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}
