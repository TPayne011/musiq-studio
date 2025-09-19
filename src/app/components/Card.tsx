// src/app/components/Card.tsx
type Props = {
  title: string;
  author?: string;
  tag?: string;
  href?: string;
};

export default function Card({ title, author, tag, href }: Props) {
  const Wrapper = href ? "a" : "div";
  return (
    <Wrapper
      {...(href ? { href } : {})}
      className="block rounded-lg border p-4 hover:shadow-sm transition"
    >
      <div className="text-sm text-gray-500">{tag}</div>
      <h3 className="text-lg font-semibold">{title}</h3>
      {author && <p className="text-sm text-gray-600">by {author}</p>}
    </Wrapper>
  );
}
