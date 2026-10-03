import Image from "next/image";
import { qrImageUrl, qrLandingUrl, segmentLabel } from "@/lib/qr-campaigns";

export type QrCardData = {
  code: string;
  name: string;
  segment: string;
  description: string | null;
  scanCount: number;
  isActive: boolean;
};

export function QrCard({ item }: { item: QrCardData }) {
  const landing = qrLandingUrl(item.code);
  const image = qrImageUrl(landing, 220);

  return (
    <div className="overflow-hidden rounded-2xl bg-white">
      <div className="flex items-start justify-between gap-3 p-5">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#ff6b2c]">
            {segmentLabel(item.segment)}
          </p>
          <h3 className="mt-1 font-black text-[#10233f]">{item.name}</h3>
          <p className="mt-1 font-mono text-xs text-slate-500">/r/{item.code}</p>
          {item.description && <p className="mt-2 text-sm text-slate-600">{item.description}</p>}
        </div>
        <span
          className={
            "shrink-0 rounded-full px-3 py-1 text-xs font-black " +
            (item.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500")
          }
        >
          {item.isActive ? "Active" : "Paused"}
        </span>
      </div>

      <div className="flex flex-col items-center gap-3 bg-slate-50 p-5">
        <Image
          src={image}
          alt={`QR code for ${item.name} - ANDRES SPORTSWEARTZ`}
          width={220}
          height={220}
          className="h-[220px] w-[220px] rounded-xl bg-white p-2 shadow-sm"
        />
        <p className="break-all text-center font-mono text-[11px] text-slate-500">{landing}</p>
        <div className="flex flex-wrap justify-center gap-2">
          <a
            href={image}
            download={`andres-qr-${item.code}.png`}
            className="rounded-full bg-[#10233f] px-4 py-2 text-xs font-black text-white"
          >
            Download QR
          </a>
          <a
            href={landing}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-white px-4 py-2 text-xs font-black text-[#1769e0] ring-1 ring-slate-200"
          >
            Open link
          </a>
        </div>
      </div>

      <div className="flex items-center justify-between p-5">
        <p className="text-sm text-slate-500">
          Scans: <b className="text-[#10233f]">{item.scanCount.toLocaleString()}</b>
        </p>
      </div>
    </div>
  );
}
