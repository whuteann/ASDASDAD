import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import AddExpense from "@/pages/AddExpense";
import Reports from "@/pages/Reports";
import BottomNavigation from "@/components/BottomNavigation";
import Header from "@/components/Header";

function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const isAddExpensePage = location === "/add-expense";

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-y-auto pb-16">
        {children}
      </main>
      {!isAddExpensePage && <BottomNavigation />}
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/add-expense" component={AddExpense} />
      <Route path="/reports" component={Reports} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Layout>
        <Router />
      </Layout>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
