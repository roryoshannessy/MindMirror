type Props = {
  children: React.ReactNode;
};

export default function QuizLayout({ children }: Props) {
  return (
    <div className="min-h-[min(100dvh,800px)] bg-[#eef7f4] bg-[radial-gradient(circle_at_50%_0%,#ffffff_0%,#f6fbfa_42%,#dcefeb_100%)]">
      {children}
    </div>
  );
}
