import { css } from "lit";
import { backgroundStyles } from "./backgrounds/scenes";

export const cardStyles = [
  backgroundStyles,
  css`
    :host {
      display: block;
    }
    ha-card {
      position: relative;
      overflow: hidden;
    }
    ha-card.has-bg {
      color: #fff;
      --primary-text-color: #fff;
      --secondary-text-color: rgba(255, 255, 255, 0.85);
    }
    .content {
      position: relative;
      z-index: 1;
      padding: 16px;
    }
    .pad {
      padding: 16px;
    }
    .empty {
      opacity: 0.75;
      text-align: center;
      font-size: 0.95rem;
    }
    .warn {
      opacity: 0.9;
      font-size: 0.9rem;
    }
    .section + .section {
      margin-top: 18px;
      padding-top: 16px;
      border-top: 1px solid
        color-mix(in srgb, currentColor 18%, transparent);
    }
    .section-header + .section {
      margin-top: 0;
      padding-top: 0;
      border-top: none;
    }
    .section-current {
      container-type: inline-size;
      container-name: current;
    }
    .main {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .action-target {
      cursor: pointer;
    }
    ha-card.layout-compact .main {
      gap: 10px;
    }
    ha-card.layout-compact .main-icon {
      width: 72px;
      height: 72px;
    }
    ha-card.layout-compact .temp {
      font-size: 2rem;
    }
    ha-card.layout-compact .chart-wrap {
      height: 150px;
    }
    ha-card.layout-minimal .main {
      gap: 8px;
    }
    ha-card.layout-minimal .main-icon {
      width: 56px;
      height: 56px;
    }
    ha-card.layout-minimal .temp {
      font-size: 1.75rem;
    }
    ha-card.layout-minimal .condition {
      font-size: 0.85rem;
    }
    ha-card.layout-minimal .location {
      font-size: 0.95rem;
    }
    ha-card.layout-minimal .details {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 6px 8px;
      margin-top: 10px;
      font-size: 0.82rem;
    }
    ha-card.layout-minimal .detail-icon {
      width: 22px;
      height: 22px;
    }
    ha-card.layout-minimal .chart-wrap {
      height: 130px;
    }
    .location {
      font-size: 1.05rem;
      font-weight: 600;
      opacity: 0.95;
    }
    .alerts-strip {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      margin-top: 12px;
      margin-bottom: 0;
      border: 1px solid color-mix(in srgb, var(--vk-alert-accent, #f59e0b) 70%, transparent);
      border-radius: 8px;
      background: color-mix(
        in srgb,
        var(--vk-alert-accent, #f59e0b) 38%,
        var(--card-background-color, #fff) 40%
      );
      color: inherit;
      font: inherit;
      text-align: left;
      cursor: pointer;
      box-sizing: border-box;
    }
    .alerts-strip--single {
      padding: 8px 10px;
    }
    .alerts-strip--multi {
      padding: 5px 10px;
    }
    .section-current .alerts-strip + .details {
      margin-top: 12px;
    }
    .alerts-strip:hover,
    .alerts-strip:focus-visible {
      background: color-mix(
        in srgb,
        var(--vk-alert-accent, #f59e0b) 48%,
        var(--card-background-color, #fff) 30%
      );
      outline: none;
    }
    .alerts-strip.sev-green {
      --vk-alert-accent: #22c55e;
    }
    .alerts-strip.sev-yellow {
      --vk-alert-accent: #eab308;
    }
    .alerts-strip.sev-orange {
      --vk-alert-accent: #f97316;
    }
    .alerts-strip.sev-red {
      --vk-alert-accent: #ef4444;
    }
    .alerts-strip.sev-purple {
      --vk-alert-accent: #a855f7;
    }
    .alerts-strip.sev-unknown {
      --vk-alert-accent: #94a3b8;
    }
    ha-card.has-bg .alerts-strip {
      background: color-mix(
        in srgb,
        var(--vk-alert-accent, #f59e0b) 42%,
        rgba(0, 0, 0, 0.4)
      );
      border-color: color-mix(
        in srgb,
        var(--vk-alert-accent, #f59e0b) 80%,
        #fff
      );
    }
    ha-card.has-bg .alerts-strip:hover,
    ha-card.has-bg .alerts-strip:focus-visible {
      background: color-mix(
        in srgb,
        var(--vk-alert-accent, #f59e0b) 52%,
        rgba(0, 0, 0, 0.35)
      );
    }
    .alerts-strip-icon {
      flex-shrink: 0;
      display: inline-flex;
    }
    .alerts-strip--single .alerts-strip-icon {
      width: 28px;
      height: 28px;
    }
    .alerts-strip--multi .alerts-strip-icon {
      width: 22px;
      height: 22px;
    }
    .alerts-strip-icon svg {
      width: 100%;
      height: 100%;
    }
    .alerts-strip-text {
      flex: 1;
      min-width: 0;
      display: grid;
      gap: 2px;
    }
    .alerts-strip-label {
      font-size: 0.88rem;
      font-weight: 600;
      line-height: 1.25;
    }
    .alerts-strip--multi .alerts-strip-label {
      font-size: 0.84rem;
      font-weight: 650;
    }
    .alerts-strip-sub {
      font-size: 0.78rem;
      font-weight: 500;
      opacity: 0.82;
      line-height: 1.2;
    }
    .alerts-strip-chevron {
      opacity: 0.7;
      font-size: 1.2rem;
      line-height: 1;
    }
    .alerts-modal-root {
      display: none;
    }
    .vk-modal:not([open]) {
      display: none;
    }
    .vk-modal[open] {
      display: block;
    }
    .vk-modal {
      position: fixed;
      inset: unset;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      margin: 0;
      padding: 0;
      border: none;
      width: min(520px, calc(100vw - 32px));
      max-height: min(85vh, 720px);
      overflow: hidden;
      border-radius: 12px;
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color, #212121);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.28);
      box-sizing: border-box;
    }
    .vk-modal::backdrop {
      background: rgba(0, 0, 0, 0.45);
    }
    .vk-modal.has-bg {
      color: #fff;
      --primary-text-color: #fff;
      --secondary-text-color: rgba(255, 255, 255, 0.85);
      background: transparent;
    }
    .vk-modal.has-bg .vk-bg {
      border-radius: 12px;
    }
    .vk-modal-inner {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      max-height: min(85vh, 720px);
    }
    .vk-modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 14px 16px 12px;
      flex-shrink: 0;
    }
    .vk-modal-title {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 650;
    }
    .vk-modal-close {
      appearance: none;
      border: 1px solid color-mix(in srgb, currentColor 22%, transparent);
      background: color-mix(in srgb, currentColor 6%, transparent);
      color: inherit;
      border-radius: 8px;
      padding: 6px 12px;
      font: inherit;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
    }
    .vk-modal-close:hover,
    .vk-modal-close:focus-visible {
      background: color-mix(in srgb, currentColor 12%, transparent);
      outline: none;
    }
    .vk-modal-body {
      overflow: auto;
      padding: 0 16px 16px;
      flex: 1;
      min-height: 0;
      --detail-section-gap: 18px;
    }
    .detail-hero {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 8px 0 12px;
      text-align: center;
    }
    .detail-hero-icon {
      width: 72px;
      height: 72px;
      display: inline-flex;
    }
    .detail-hero-icon svg {
      width: 100%;
      height: 100%;
    }
    .detail-hero-label {
      font-size: 0.95rem;
      opacity: 0.88;
    }
    .detail-hero-value {
      font-size: 2.4rem;
      font-weight: 700;
      line-height: 1.1;
      letter-spacing: -0.02em;
    }
    .detail-hero-value.is-text {
      font-size: 1.35rem;
      line-height: 1.25;
      letter-spacing: -0.01em;
      max-width: 28ch;
    }
    .detail-copy {
      margin: 0 0 8px;
      font-size: 0.95rem;
      line-height: 1.45;
      opacity: 0.92;
      text-align: center;
    }
    .detail-chart-scroll {
      margin: var(--detail-section-gap) -4px 14px;
    }
    .detail-chart-scroll .detail-chart-wrap {
      height: 150px;
      margin-bottom: 0;
    }
    .detail-chart-wrap {
      height: 160px;
      margin-bottom: 14px;
    }
    .detail-chart-wrap canvas {
      width: 100% !important;
      height: 100% !important;
    }
    .detail-no-chart {
      margin: 0 0 14px;
      font-size: 0.88rem;
      opacity: 0.75;
      text-align: center;
    }
    .detail-related {
      margin: 0;
      display: grid;
      gap: 8px;
    }
    .detail-related-row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      font-size: 0.9rem;
      padding: 8px 0;
      border-top: 1px solid color-mix(in srgb, currentColor 14%, transparent);
    }
    .detail-related-row dt {
      margin: 0;
      opacity: 0.8;
      font-weight: 500;
    }
    .detail-related-row dd {
      margin: 0;
      font-weight: 650;
    }
    .detail-sun-arc {
      margin-bottom: 8px;
    }
    .detail-sun-chart {
      position: relative;
      margin-top: var(--detail-section-gap);
      margin-bottom: 8px;
      overflow: visible;
    }
    .detail-sun-arc-svg {
      display: block;
      width: 100%;
      height: auto;
      overflow: visible;
    }
    .detail-sun-horizon {
      stroke: color-mix(in srgb, #e57373 55%, currentColor);
      stroke-width: 1.5;
      opacity: 0.85;
    }
    .detail-sun-day-path {
      fill: none;
      stroke: color-mix(in srgb, currentColor 55%, transparent);
      stroke-width: 3;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .detail-sun-night-path {
      fill: none;
      stroke: color-mix(in srgb, currentColor 35%, transparent);
      stroke-width: 2.5;
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-dasharray: 5 6;
    }
    .detail-sun-now {
      position: absolute;
      width: 28px;
      height: 28px;
      transform: translate(-50%, -50%);
      pointer-events: none;
      z-index: 2;
      border-radius: 50%;
      background: radial-gradient(
        circle,
        rgba(255, 241, 118, 0.95) 0%,
        rgba(255, 213, 79, 0.75) 45%,
        rgba(255, 193, 7, 0.15) 70%,
        transparent 100%
      );
      box-shadow: 0 0 14px 4px rgba(255, 213, 79, 0.65);
    }
    .detail-sun-details {
      margin: 12px 0 0;
      display: grid;
      gap: 0;
    }
    .detail-sun-detail-row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      padding: 10px 0;
      border-top: 1px solid color-mix(in srgb, currentColor 12%, transparent);
      font-size: 0.92rem;
    }
    .detail-sun-detail-row dt {
      margin: 0;
      opacity: 0.85;
      font-weight: 500;
    }
    .detail-sun-detail-row dd {
      margin: 0;
      font-weight: 650;
    }
    .detail-sun-detail-row.is-summary dd {
      font-weight: 700;
    }
    .detail-uv-hero {
      margin-bottom: 14px;
    }
    .detail-uv-category {
      font-size: 1.35rem;
      font-weight: 700;
      line-height: 1.2;
    }
    .detail-uv-category-low {
      color: #22c55e;
    }
    .detail-uv-category-moderate {
      color: #eab308;
    }
    .detail-uv-category-high {
      color: #f97316;
    }
    .detail-uv-category-very_high {
      color: #ef4444;
    }
    .detail-uv-category-extreme {
      color: #a855f7;
    }
    .detail-uv-bar-wrap {
      margin-top: var(--detail-section-gap);
      margin-bottom: 14px;
    }
    .detail-uv-bar-track {
      position: relative;
      height: 8px;
      border-radius: 999px;
      background: linear-gradient(
        to right,
        #22c55e 0%,
        #22c55e 16%,
        #eab308 28%,
        #f97316 45%,
        #ef4444 64%,
        #a855f7 88%,
        #a855f7 100%
      );
    }
    .detail-uv-bar-dot {
      position: absolute;
      top: 50%;
      width: 14px;
      height: 14px;
      margin-left: -7px;
      transform: translateY(-50%);
      border-radius: 50%;
      background: #fff;
      box-shadow:
        0 0 0 2px rgba(255, 255, 255, 0.35),
        0 1px 4px rgba(0, 0, 0, 0.25);
    }
    .detail-uv-advice {
      margin-top: -4px;
    }
    .alerts-accordion {
      list-style: none;
      margin: var(--detail-section-gap) 0 0;
      padding: 0;
      display: grid;
      gap: 8px;
    }
    .alerts-acc-item {
      border: 1px solid color-mix(in srgb, currentColor 14%, transparent);
      border-left: 3px solid var(--vk-alert-accent, #94a3b8);
      border-radius: 10px;
      overflow: hidden;
      background: transparent;
      transition: border-color 0.15s ease;
    }
    .alerts-acc-item:hover,
    .alerts-acc-item:has(.alerts-acc-header:focus-visible) {
      border-top-color: color-mix(in srgb, currentColor 22%, transparent);
      border-right-color: color-mix(in srgb, currentColor 22%, transparent);
      border-bottom-color: color-mix(in srgb, currentColor 22%, transparent);
      border-left-color: var(--vk-alert-accent, #94a3b8);
    }
    .alerts-acc-item.sev-green {
      --vk-alert-accent: #22c55e;
    }
    .alerts-acc-item.sev-yellow {
      --vk-alert-accent: #eab308;
    }
    .alerts-acc-item.sev-orange {
      --vk-alert-accent: #f97316;
    }
    .alerts-acc-item.sev-red {
      --vk-alert-accent: #ef4444;
    }
    .alerts-acc-item.sev-purple {
      --vk-alert-accent: #a855f7;
    }
    .alerts-acc-item.sev-unknown {
      --vk-alert-accent: #94a3b8;
    }
    .alerts-acc-header {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      width: 100%;
      padding: 10px 12px;
      border: 0;
      background: transparent;
      color: inherit;
      font: inherit;
      text-align: left;
      cursor: pointer;
    }
    .alerts-acc-header:focus-visible {
      outline: none;
    }
    .alerts-acc-item.is-expanded .alerts-acc-header {
      padding-bottom: 8px;
    }
    .alerts-acc-icon {
      width: 32px;
      height: 32px;
      flex-shrink: 0;
      margin-top: 1px;
    }
    .alerts-acc-icon svg {
      width: 100%;
      height: 100%;
    }
    .alerts-acc-main {
      display: grid;
      gap: 4px;
      min-width: 0;
      flex: 1;
    }
    .alerts-acc-title {
      font-weight: 650;
      font-size: 0.95rem;
      line-height: 1.25;
    }
    .alerts-acc-sub {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 0.82rem;
      opacity: 0.78;
      line-height: 1.3;
    }
    .alerts-acc-pin {
      display: inline-flex;
      flex-shrink: 0;
      opacity: 0.85;
    }
    .alerts-acc-pin svg {
      display: block;
    }
    .alerts-acc-time {
      font-size: 0.8rem;
      opacity: 0.72;
    }
    .alerts-acc-chevron {
      opacity: 0.65;
      font-size: 1.1rem;
      line-height: 1;
      margin-top: 4px;
    }
    .alerts-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .alerts-badge {
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      border-radius: 999px;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.01em;
      text-transform: capitalize;
      background: color-mix(
        in srgb,
        var(--vk-alert-accent, #94a3b8) 22%,
        transparent
      );
      color: inherit;
      border: 1px solid
        color-mix(in srgb, var(--vk-alert-accent, #94a3b8) 45%, transparent);
    }
    .alerts-badge.sev-green {
      --vk-alert-accent: #22c55e;
    }
    .alerts-badge.sev-yellow {
      --vk-alert-accent: #eab308;
    }
    .alerts-badge.sev-orange {
      --vk-alert-accent: #f97316;
    }
    .alerts-badge.sev-red {
      --vk-alert-accent: #ef4444;
    }
    .alerts-badge.sev-purple {
      --vk-alert-accent: #a855f7;
    }
    .alerts-badge.sev-unknown {
      --vk-alert-accent: #94a3b8;
    }
    .alerts-badge-phase {
      --vk-alert-accent: color-mix(in srgb, currentColor 55%, transparent);
      font-weight: 600;
      text-transform: none;
    }
    .alerts-acc-body {
      display: grid;
      gap: 10px;
      padding: 0 12px 12px 54px;
    }
    .alerts-times {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin: 0;
      font-size: 0.85rem;
    }
    .alerts-times dt {
      opacity: 0.65;
      font-size: 0.75rem;
      margin: 0;
    }
    .alerts-times dd {
      margin: 2px 0 0;
      font-weight: 600;
    }
    .alerts-body,
    .alerts-instruction {
      margin: 0;
      font-size: 0.9rem;
      line-height: 1.45;
    }
    .alerts-body {
      white-space: normal;
    }
    .alerts-instruction {
      opacity: 0.92;
    }
    .condition {
      text-transform: capitalize;
      opacity: 0.8;
      font-size: 0.95rem;
      margin-top: 2px;
    }
    .temp-row {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px 10px;
      margin-top: 4px;
    }
    .temp {
      font-size: 2.4rem;
      font-weight: 650;
      line-height: 1.1;
    }
    .feels-like {
      opacity: 0.8;
      font-size: 0.95rem;
    }
    .main-icon {
      width: 96px;
      height: 96px;
      flex-shrink: 0;
    }
    .main-icon svg {
      width: 100%;
      height: 100%;
    }
    .details {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      column-gap: 12px;
      row-gap: 10px;
      margin-top: 14px;
      font-size: 0.9rem;
      opacity: 0.95;
    }
    @container current (min-width: 380px) {
      .details {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
    }
    .detail {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      min-width: 0;
      appearance: none;
      border: none;
      background: transparent;
      color: inherit;
      font: inherit;
      padding: 0;
      cursor: pointer;
      text-align: left;
    }
    .detail:hover,
    .detail:focus-visible {
      opacity: 1;
      outline: none;
      text-decoration: underline;
      text-underline-offset: 2px;
    }
    .detail-icon {
      width: 26px;
      height: 26px;
      display: inline-flex;
    }
    .detail-icon svg {
      width: 100%;
      height: 100%;
    }
    .tip {
      position: relative;
      display: inline-flex;
      align-items: center;
    }
    .tip::after {
      content: attr(data-tip);
      position: absolute;
      left: 50%;
      bottom: calc(100% + 6px);
      transform: translateX(-50%) translateY(2px);
      background: rgba(20, 20, 20, 0.92);
      color: #fff;
      font-size: 0.72rem;
      line-height: 1.25;
      padding: 4px 8px;
      border-radius: 6px;
      white-space: nowrap;
      max-width: 220px;
      white-space: normal;
      width: max-content;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.12s ease, transform 0.12s ease;
      z-index: 5;
      text-align: center;
    }
    .tip:hover::after,
    .tip:focus-within::after {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    ha-card.has-bg .tip::after {
      background: rgba(255, 255, 255, 0.95);
      color: #111;
    }
    .forecast {
      margin-top: 0;
    }
    .forecast-scroll {
      --forecast-col-width: 42px;
      overflow-x: auto;
      overflow-y: hidden;
      overscroll-behavior-x: contain;
      -webkit-overflow-scrolling: touch;
      margin-left: -4px;
      margin-right: -4px;
      padding-left: 4px;
      padding-right: 4px;
    }
    .forecast-scroll-inner {
      min-width: 100%;
    }
    .forecast-scroll .forecast-scroll-inner {
      width: max(100%, calc(var(--cols, 12) * var(--forecast-col-width)));
    }
    .forecast-scroll .chart-wrap {
      width: max(100%, calc(var(--cols, 12) * var(--forecast-col-width)));
      height: 150px;
      overflow: hidden;
    }
    .forecast-scroll .forecast-row-slot {
      margin-left: 0;
      width: max(100%, calc(var(--cols, 12) * var(--forecast-col-width)));
    }
    .forecast-scroll .forecast-icon {
      width: 32px;
      height: 32px;
    }
    .forecast-scroll .wind-icon {
      width: 20px;
      height: 20px;
    }
    .forecast-scroll .wind-meta {
      font-size: 0.65rem;
    }
    .chart-wrap {
      height: 180px;
      width: 100%;
    }
    .forecast-row-slot {
      box-sizing: border-box;
    }
    .forecast-row {
      display: grid;
      grid-template-columns: repeat(var(--cols, 5), minmax(0, 1fr));
      gap: 0;
      margin-top: 2px;
      width: 100%;
    }
    .forecast-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      min-width: 0;
    }
    .forecast-icon {
      width: 40px;
      height: 40px;
    }
    .forecast-icon svg,
    .wind-icon svg {
      width: 100%;
      height: 100%;
    }
    .forecast-wind {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }
    .forecast-wind .wind-pair {
      display: inline-flex;
      align-items: center;
      gap: 3px;
    }
    .wind-icon {
      width: 24px;
      height: 24px;
    }
    .wind-meta {
      font-size: 0.7rem;
      opacity: 0.85;
      text-align: center;
      line-height: 1.2;
    }
  `,
];
