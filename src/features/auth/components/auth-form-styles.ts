export const authInputClassName =
  "min-h-12 w-full rounded-2xl border border-border bg-background px-11 text-base text-foreground outline-none transition-[border-color,box-shadow,background-color] duration-200 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] placeholder:text-muted-foreground focus:border-[var(--auth-focus)] focus:ring-4 focus:ring-primary/15"

export const authLabelClassName = "text-sm font-semibold text-foreground"

export const authErrorClassName =
  "text-sm font-medium text-[var(--status-failed-text)]"

export const authInlineErrorClassName =
  "rounded-2xl border border-[var(--status-failed-border)] bg-[var(--status-failed-bg)] px-4 py-3 text-sm text-[var(--status-failed-text)]"

export const authButtonClassName =
  "min-h-12 w-full rounded-full bg-[var(--auth-action-bg)] text-base font-semibold text-[var(--auth-action-foreground)] shadow-sm transition-[background-color,box-shadow,transform] duration-200 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:bg-[var(--auth-action-bg-hover)] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--auth-focus)] focus-visible:ring-offset-2 active:scale-[0.98]"

export const authTextLinkClassName =
  "rounded-sm font-semibold text-[var(--auth-link)] underline-offset-4 transition-colors duration-200 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:text-[var(--auth-link-hover)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--auth-focus)] focus-visible:ring-offset-2"
