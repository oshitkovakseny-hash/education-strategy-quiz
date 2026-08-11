// Submits a contact to MailerLite using the same mechanism MailerLite's own
// embedded-form widget uses: a real HTML <form> POST to their public
// webforms endpoint, targeted at a hidden iframe. This requires no API key
// (the endpoint is meant to be called directly from a browser) and sidesteps
// CORS entirely, since a same-page <form> submission isn't subject to it —
// unlike a fetch()/XHR call, which the endpoint doesn't support anyway.
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
// 1. Create an embedded form in MailerLite and put its form ID below.
// 2. Create the custom fields listed below (same keys) in MailerLite.
// 3. Build an automation: "Subscriber joins group" (the form's group) ->
//    send an email using the merge tags documented in README.md.
const MAILERLITE_FORM_ID = "REPLACE_WITH_YOUR_MAILERLITE_FORM_ID";

export function isMailerLiteConfigured() {
  return MAILERLITE_FORM_ID !== "REPLACE_WITH_YOUR_MAILERLITE_FORM_ID";
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
      console.warn("MailerLite form ID isn't set — skipping submission. See src/mailerlite.js.");
      resolve(false);
      return;
    }

    const iframeName = `ml-submit-frame-${Date.now()}`;
    const iframe = document.createElement("iframe");
    iframe.name = iframeName;
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    const form = document.createElement("form");
    form.action = `https://static.mailerlite.com/webforms/submit/${MAILERLITE_FORM_ID}`;
    form.method = "POST";
    form.target = iframeName;
    form.style.display = "none";

    const fields = {
      "ml-submit": "1",
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
