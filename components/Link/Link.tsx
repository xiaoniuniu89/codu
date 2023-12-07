import { useRouter } from "next/navigation";
import { start, done } from "nprogress";
import { usePromptService } from "@/context/PromptServiceContext";
import { useEffect } from "react";

interface LinkProps {
  to: string;
  children: string;
  className?: string;
}

const Link = ({ to, children, className }: LinkProps) => {
  const router = useRouter();
  const { unsavedChanges, setUnsavedChanges } = usePromptService();

  const handleNavigation = (event) => {
    event.preventDefault();

    if (unsavedChanges) {
      const userConfirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to leave?",
      );
      if (userConfirmed) {
        start();
        router.push(to);
        setUnsavedChanges(false);
      }
    } else {
      setUnsavedChanges(false);
      return null;
    }
  };

  useEffect(() => {
    done();
  }, [unsavedChanges, setUnsavedChanges]);

  return (
    <a href={to} onClick={handleNavigation} className={className}>
      {children}
    </a>
  );
};

export default Link;
