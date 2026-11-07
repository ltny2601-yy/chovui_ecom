// Searchable school picker (react-select) layered over the native <select> elements of the site.
import React from "https://esm.sh/react@18.3.1";
import { createRoot } from "https://esm.sh/react-dom@18.3.1/client?deps=react@18.3.1";
import Select from "https://esm.sh/react-select@5.8.0?deps=react@18.3.1,react-dom@18.3.1";

const IDS = ["pick", "fUni", "upUni", "sUni", "wUni", "pUni"];
const h = React.createElement;
const norm = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/gi, "d").toLowerCase();
const nativeValue = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value");

function readOptions(sel) {
  const out = [];
  let empty = null;
  for (const node of sel.children) {
    if (node.tagName === "OPTGROUP") out.push({ label: node.label, options: [...node.children].map((o) => ({ value: o.value, label: o.textContent })) });
    else if (node.value === "") empty = node.textContent;
    else out.push({ value: node.value, label: node.textContent });
  }
  return { out, empty };
}
const flat = (opts) => opts.flatMap((o) => o.options || [o]);

const styles = {
  control: (b, s) => ({ ...b, minHeight: 44, borderRadius: 12, borderWidth: 1.5, borderColor: s.isFocused ? "#FF9EB5" : "#EFE6EE", boxShadow: "none", background: "#fff", "&:hover": { borderColor: "#FF9EB5" } }),
  menuPortal: (b) => ({ ...b, zIndex: 90 }),
  menu: (b) => ({ ...b, borderRadius: 14, overflow: "hidden", fontFamily: "Nunito, system-ui, sans-serif" }),
  groupHeading: (b) => ({ ...b, color: "#7A7493", fontWeight: 800, textTransform: "none", fontSize: 12.5 }),
  option: (b, s) => ({ ...b, background: s.isSelected ? "#C2456B" : s.isFocused ? "#FFD6E0" : "#fff", color: s.isSelected ? "#fff" : "#3F3A5E", cursor: "pointer" }),
  placeholder: (b) => ({ ...b, color: "#7A7493" }),
  singleValue: (b) => ({ ...b, color: "#3F3A5E", fontWeight: 600 }),
  input: (b) => ({ ...b, color: "#3F3A5E" })
};
const pickStyles = { ...styles, control: (b, s) => ({ ...styles.control(b, s), minHeight: 38, borderRadius: 999, borderWidth: 0, background: "#E3DAFB", fontWeight: 700 }) };

function enhance(sel) {
  if (sel.dataset.rs) return;
  sel.dataset.rs = "1";
  const host = document.createElement("div");
  host.className = "rs-host" + (sel.id === "pick" ? " rs-pick" : "");
  sel.insertAdjacentElement("afterend", host);
  sel.classList.add("rs-native");
  const label = sel.id ? document.querySelector('label[for="' + sel.id + '"]') : null;
  const root = createRoot(host);
  function render() {
    const { out, empty } = readOptions(sel);
    const cur = flat(out).find((o) => o.value === nativeValue.get.call(sel)) || null;
    root.render(h(Select, {
      options: out,
      value: cur,
      isSearchable: true,
      isClearable: empty != null,
      placeholder: (empty || "Chọn trường") + " (gõ để tìm)",
      inputId: sel.id ? sel.id + "-rs" : undefined,
      "aria-label": sel.getAttribute("aria-label") || (label ? label.textContent.replace("*", "").trim() : "Chọn trường"),
      noOptionsMessage: () => "Không tìm thấy trường phù hợp",
      filterOption: (o, q) => !q || norm(o.label).includes(norm(q)) || norm(o.value).includes(norm(q)),
      onChange: (o) => { nativeValue.set.call(sel, o ? o.value : ""); render(); sel.dispatchEvent(new Event("change", { bubbles: true })); },
      menuPortalTarget: document.body,
      menuPlacement: "auto",
      styles: sel.id === "pick" ? pickStyles : styles
    }));
  }
  Object.defineProperty(sel, "value", { configurable: true, get() { return nativeValue.get.call(this); }, set(v) { nativeValue.set.call(this, v); render(); } });
  if (label) label.htmlFor = sel.id + "-rs";
  new MutationObserver(render).observe(sel, { childList: true, subtree: true });
  render();
}
function scan() { IDS.forEach((id) => { const el = document.getElementById(id); if (el && el.tagName === "SELECT") enhance(el); }); }
const css = document.createElement("style");
css.textContent = ".rs-native{display:none!important}.rs-host{width:100%;min-width:0}.rs-pick{width:240px;flex-shrink:0}@media(max-width:760px){.rs-pick{width:180px;margin-left:auto;font-size:13px}}";
document.head.appendChild(css);
scan();
new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });