(function () {
  var form = document.getElementById("inquiry-form");
  if (!form) return;

  var lang = document.documentElement.lang;
  if (!{ en: 1, ko: 1, ja: 1, es: 1 }[lang]) lang = "en";
  var config = (window.SITE_CONFIG || {})[lang] || {};
  var text = {
    en: {
      sending: "Sending…",
      ok: "Thank you. Your request was sent. We will contact you at the email address you provided.",
      fail: "Your request could not be sent. Check your connection and try again.",
      mail: "Your email app should now open with this request filled in. Press send there to finish. If nothing opened, your request has not been sent.",
      off: "This form is not connected yet, so your request was not sent. Your entries passed validation.",
      sample: "Sample request",
      inquiry: "Wholesale inquiry"
    },
    ko: {
      sending: "보내는 중…",
      ok: "감사합니다. 요청이 접수되었습니다. 입력하신 이메일로 연락드리겠습니다.",
      fail: "요청을 보내지 못했습니다. 인터넷 연결을 확인한 뒤 다시 시도해 주세요.",
      mail: "이메일 앱이 열리면 내용을 확인하고 보내기를 눌러 주세요. 앱이 열리지 않았다면 요청은 전송되지 않은 상태입니다.",
      off: "아직 폼이 연결되지 않아 요청이 전송되지 않았습니다. 입력 내용 검사는 통과했습니다.",
      sample: "샘플 요청",
      inquiry: "도매 문의"
    },
    ja: {
      sending: "送信中…",
      ok: "ありがとうございます。お問い合わせを受け付けました。ご入力のメールアドレスへご連絡します。",
      fail: "送信できませんでした。接続を確認してもう一度お試しください。",
      mail: "メールアプリが開いたら内容を確認し、送信してください。開かない場合、お問い合わせはまだ送信されていません。",
      off: "フォームが未接続のため送信されませんでした。入力内容の確認は完了しています。",
      sample: "サンプル請求",
      inquiry: "卸売のお問い合わせ"
    },
    es: {
      sending: "Enviando…",
      ok: "Gracias. Hemos recibido su solicitud. Le escribiremos al correo que nos proporcionó.",
      fail: "No se pudo enviar su solicitud. Compruebe su conexión e inténtelo de nuevo.",
      mail: "Su aplicación de correo debería abrirse con la solicitud completada. Pulse enviar allí para terminar. Si no se abrió, su solicitud no se ha enviado.",
      off: "El formulario aún no está conectado, por lo que su solicitud no se envió. Sus datos pasaron la validación.",
      sample: "Solicitud de muestra",
      inquiry: "Consulta mayorista"
    }
  }[lang];

  var status = document.getElementById("form-status");
  var address = document.getElementById("sample-address");
  var addressInput = document.getElementById("f-address");
  var submit = form.querySelector('button[type="submit"]');

  function showStatus(message, kind) {
    status.textContent = message;
    status.className = "form-status" + (kind ? " " + kind : "");
    status.hidden = false;
  }

  function syncType() {
    var isSample = form.elements["request_type"].value === "sample";
    address.hidden = !isSample;
  }

  var wanted = new URLSearchParams(location.search).get("type");
  if (wanted === "sample" || wanted === "inquiry") form.elements["request_type"].value = wanted;
  form.querySelectorAll('input[name="request_type"]').forEach(function (radio) {
    radio.addEventListener("change", syncType);
  });
  syncType();

  function summary(data) {
    var lines = [];
    form.querySelectorAll("[data-label]").forEach(function (el) {
      if (el.closest("[hidden]")) return;
      var value = data.get(el.name);
      if (value) lines.push(el.getAttribute("data-label") + ": " + value);
    });
    return lines.join("\n");
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!form.reportValidity()) return;

    var data = new FormData(form);
    if (data.get("website")) return; // honeypot filled in: treat as a bot
    data.delete("website");

    var isSample = data.get("request_type") === "sample";
    var subject = (isSample ? text.sample : text.inquiry) + " - " + data.get("business");
    if (!isSample) data.delete("address");
    data.append("_subject", subject);
    data.append("site_language", lang);

    if (config.endpoint) {
      submit.disabled = true;
      showStatus(text.sending);
      // The email shows readable, translated labels instead of field names.
      var payload = new FormData();
      payload.append(isSample ? text.sample : text.inquiry, data.get("business"));
      form.querySelectorAll("[data-label]").forEach(function (el) {
        if (el.closest("[hidden]")) return;
        var value = data.get(el.name);
        if (value) payload.append(el.getAttribute("data-label"), value);
      });
      payload.append("_replyto", data.get("email"));
      payload.append("_subject", subject);
      payload.append("_template", "table");
      payload.append("_captcha", "false");
      fetch(config.endpoint, { method: "POST", body: payload, headers: { Accept: "application/json" } })
        .then(function (res) {
          if (!res.ok) throw new Error("HTTP " + res.status);
          return res.json();
        })
        .then(function (result) {
          if (String(result.success) !== "true") throw new Error(result.message || "Not sent");
          form.reset();
          syncType();
          showStatus(text.ok, "ok");
        })
        .catch(function () { showStatus(text.fail, "error"); })
        .finally(function () { submit.disabled = false; });
    } else if (config.email) {
      location.href = "mailto:" + config.email +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(summary(data));
      showStatus(text.mail);
    } else {
      showStatus(text.off, "error");
    }
  });
})();
