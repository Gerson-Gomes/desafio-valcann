import { fascinateInline } from "@/app/layout";

export default function Header() {
  return (
    <h1 className={`${fascinateInline.className} m-10 pb-25 text-7xl`}>
      Universe<span className="text-yellow-300">Ex</span>
    </h1>
  );
}