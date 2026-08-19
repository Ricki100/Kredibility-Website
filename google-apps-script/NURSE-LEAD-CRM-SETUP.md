# Nurse lead Google Sheets CRM setup

The nurse landing page already delivers each completed lead through Web3Forms before opening WhatsApp. Complete these steps to also copy each lead into a Google Sheet CRM.

1. Create or open the Google Sheet that should hold campaign leads.
2. Select `Extensions` > `Apps Script`.
3. Paste the contents of `nurse-lead-crm.gs` into the editor and save.
4. Select `Deploy` > `New deployment` > `Web app`.
5. Set `Execute as` to `Me` and `Who has access` to `Anyone`.
6. Deploy, approve the permissions and copy the `/exec` Web app URL.
7. Open `nurse-loans.html` and paste that URL into the form attribute:

   ```html
   data-crm-endpoint="YOUR_GOOGLE_APPS_SCRIPT_EXEC_URL"
   ```

8. Publish the updated website and submit one test lead.
9. Confirm that the `Nurse Loan Leads` tab contains the test row and that WhatsApp opens.
10. Delete the test row after verification.

The sheet includes lightweight CRM columns for status, owner, follow-up date and notes. Restrict Sheet access to authorised Kredibility staff, enable two-step verification on their Google accounts, and apply the approved retention schedule.
