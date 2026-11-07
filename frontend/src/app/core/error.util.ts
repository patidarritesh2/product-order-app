import { HttpErrorResponse } from '@angular/common/http';

/** Turns an API error into a readable message. */
export function errMsg(e: unknown): string {
  const body = (e as HttpErrorResponse)?.error;
  if (body?.errors?.length) {
    return body.errors.map((x: { field: string; message: string }) => `${x.field}: ${x.message}`).join('; ');
  }
  if (body?.message) return body.message;
  if ((e as HttpErrorResponse)?.status === 0) return 'Cannot reach the server';
  return 'Something went wrong';
}
