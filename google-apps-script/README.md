# Loan Application Google Sheets Setup

Use this once to connect the website form to email and Google Sheets.

1. Create a Google Sheet named `Kredibility Loan Applications`.
2. In that sheet, open `Extensions` > `Apps Script`.
3. Paste the contents of `loan-application-webhook.gs` into the Apps Script editor.
4. Save the project.
5. Click `Deploy` > `New deployment`.
6. Choose type `Web app`.
7. Set `Execute as` to `Me`.
8. Set `Who has access` to `Anyone`.
9. Deploy and approve the permissions.
10. Copy the Web app URL.
11. In `apply.html`, paste that URL into the form's `data-endpoint` value.

Applications will be appended to the `Loan Applications` sheet tab and emailed to:

- `kredibilityweb@gmail.com`
- `admin@kredibilityfinance.co.zw`

## Immediate Email Fallback

The form also has an immediate free email relay configured through FormSubmit:

```html
data-email-endpoint="https://formsubmit.co/ajax/kredibilityweb@gmail.com"
data-email-cc="admin@kredibilityfinance.co.zw"
```

The first live submission may require confirming `kredibilityweb@gmail.com` with FormSubmit. After confirmation, form submissions are emailed to `kredibilityweb@gmail.com` and copied to `admin@kredibilityfinance.co.zw`.
