// Submits a contact to MailerLite by POSTing to the exact endpoint their own
// embedded-form widget uses — copied from the real embed code MailerLite
// generated for this form, not guessed. Submission goes through a hidden
// iframe instead of their default target="_blank" (which would pop open a
// blank tab showing the raw response). No API key is involved: the endpoint
// is meant to be called directly from a browser, and a same-page <form>
// submission isn't subject to CORS the way a fetch()/XHR call would be.
//
// One real limitation of this approach: because the response lands in a
// hidden iframe we don't read, we can't detect whether MailerLite actually
// accepted the submission. This function always resolves after a short
// delay — that's the trade-off of the no-backend, no-API-key setup.
//
// The MailerLite Universal account script (index.html <head>, account
// 2568725) is separate from this — it only identifies the site to
// MailerLite for tracking and for any dashboard-configured pop-ups. It
// has no documented JS method for submitting arbitrary custom field
// values, so it can't replace the form submission below.
//
// REQUIRED SETUP (see README.md "MailerLite setup" section):
// 1. Create the custom fields listed below (same keys) in MailerLite.
// 2. Build an automation: "Subscriber joins group" (this form's group) ->
//    send an email using the merge tags documented in README.md.
const MAILERLITE_ACCOUNT_ID = "2568725";
const MAILERLITE_FORM_ID = "195474036978878332";

export function isMailerLiteConfigured() {
  return Boolean(MAILERLITE_ACCOUNT_ID && MAILERLITE_FORM_ID);
}

export function submitToMailerLite({
  email,
  ageGroup,
  ageLabel,
  total,
  levelTitle,
  levelText,
  priorityNote,
  recommendations,
}) {
  return new Promise(resolve => {
    if (!isMailerLiteConfigured()) {
      console.warn("MailerLite isn't configured — skipping submission. See src/mailerlite.js.");
      resolve(false);
      return;
    }

    const iframeName = `ml-submit-frame-${Date.now()}`;
    const iframe = document.createElement("iframe");
    iframe.name = iframeName;
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    const form = document.createElement("form");
    form.action = `https://assets.mailerlite.com/jsonp/${MAILERLITE_ACCOUNT_ID}/forms/${MAILERLITE_FORM_ID}/subscribe`;
    form.method = "POST";
    form.target = iframeName;
    form.style.display = "none";

    const fields = {
      "fields[email]": email,
      "fields[age_group]": ageGroup,
      "fields[age_label]": ageLabel,
      "fields[total_score]": String(total),
      "fields[level_title]": levelTitle,
      "fields[level_text]": levelText,
      "fields[priority_note]": priorityNote || "",
      "fields[recommendation_1]": recommendations[0] || "",
      "fields[recommendation_2]": recommendations[1] || "",
      "fields[recommendation_3]": recommendations[2] || "",
      "ml-submit": "1",
      anticsrf: "true",
    };

    for (const [name, value] of Object.entries(fields)) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value;
      form.appendChild(input);
    }

    document.body.appendChild(form);
    form.submit();

    setTimeout(() => {
      form.remove();
      iframe.remove();
      resolve(true);
    }, 1200);
  });
}
