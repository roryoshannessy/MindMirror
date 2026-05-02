type Props = {
  children: React.ReactNode;
};

export default function QuizLayout({ children }: Props) {
  return <div className="min-h-[min(100dvh,800px)]">{children}</div>;
}
