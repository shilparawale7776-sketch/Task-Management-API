
import {
  LayoutDashboard,
  ListTodo,
  CheckCircle2,
  Clock3,
  LogOut,
  Zap,
} from "lucide-react";

function Sidebar({ activePage, onNavigate, onLogout }) {
  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "All Tasks", icon: ListTodo },
    { name: "Completed", icon: CheckCircle2 },
    { name: "Pending", icon: Clock3 },
  ];

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon"><Zap size={25} /></div>
        <h1>Task<span>Flow</span></h1>
      </div>

      <p className="sidebar-label">WORKSPACE</p>

      <nav className="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.name}
              onClick={() => onNavigate(item.name)}
              className={`sidebar-link ${activePage === item.name ? "active-link" : ""}`}
            >
              <Icon size={21} />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-tip">
        <Zap size={23} />
        <h3>Stay Productive!</h3>
        <p>Small steps lead to big achievements.</p>
      </div>

      <button className="logout-button" onClick={onLogout}>
        <LogOut size={20} /> Logout
      </button>

      <p className="sidebar-footer">TaskFlow © 2026</p>
    </aside>
  );
}

export default Sidebar;
