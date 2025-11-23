// Centralized Clerk appearance configuration for consistent theming and performance
export const clerkAppearance = {
  baseTheme: undefined,
  variables: {
    colorPrimary: "#6366f1", // indigo-500
    colorBackground: "#ffffff",
    colorInputBackground: "#ffffff",
    colorInputText: "#000000",
  },
  elements: {
    formButtonPrimary: "bg-indigo-600 hover:bg-indigo-700 text-white",
    card: "bg-white dark:bg-gray-800 shadow-lg",
    headerTitle: "text-gray-900 dark:text-white",
    headerSubtitle: "text-gray-600 dark:text-gray-400",
    socialButtonsBlockButton: "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600",
    socialButtonsBlockButtonText: "text-gray-700 dark:text-gray-300",
    formFieldInput: "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white",
    formFieldLabel: "text-gray-700 dark:text-gray-300",
    identityPreviewText: "text-gray-600 dark:text-gray-400",
    formResendCodeLink: "text-indigo-600 dark:text-indigo-400",
    footerActionLink: "text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300",
  },
};

// Theme-aware appearance configuration
export const getClerkAppearance = (theme: string | undefined) => ({
  ...clerkAppearance,
  variables: {
    ...clerkAppearance.variables,
    colorBackground: theme === 'dark' ? "#1f2937" : "#ffffff",
    colorInputBackground: theme === 'dark' ? "#374151" : "#ffffff",
    colorInputText: theme === 'dark' ? "#ffffff" : "#000000",
  },
  elements: {
    ...clerkAppearance.elements,
    card: `bg-white dark:bg-gray-800 shadow-lg ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`,
  },
});

// UserButton specific appearance
export const userButtonAppearance = {
  elements: {
    avatarBox: "w-8 h-8",
    userButtonPopoverCard: "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700",
    userButtonPopoverActionButton: "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700",
  }
};
