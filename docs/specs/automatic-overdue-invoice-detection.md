Title: Automatic Overdue Invoice Detection

Purpose: Automatically marks unpaid invoices as overdue once their due date has passed, so nobody has to check due dates by hand.

Steps:
1. Take an invoice's current status and its due date.
2. Compare the due date with today's date.
3. If today is the due date itself, the invoice is not late yet: 0 days overdue.
4. If today is before the due date, the invoice is also 0 days overdue. The count never goes below zero.
5. If today is after the due date, count the whole days that have passed. For example, due on 25 September and checked on 3 October gives 8 days overdue.
6. If the invoice is Open and past its due date, change its status to Overdue.
7. If the invoice is Open but not yet past its due date, leave it as Open.
8. Never change an invoice that is Paid, Credited or Draft, even if its due date is long gone.

Unclear:
- What happens after an invoice becomes Overdue: no reminders, fees or notifications are described.
- Whether an Overdue invoice ever goes back to Open, for example after a due date change.
- How "today" is determined, including time zones.
- What happens with a missing or invalid due date.
- Whether statuses other than Open, Paid, Credited, Draft and Overdue exist, and how they are treated.
