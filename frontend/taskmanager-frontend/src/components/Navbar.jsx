
import { Search, Bell, Sparkles, X } from "lucide-react";

function Navbar({ activePage, searchTerm, onSearch, username }) {
  const descriptions = {
    Dashboard: "Organize your work and achieve your goals.",
    "All Tasks": "Manage all your tasks in one place.",
    Completed: "Celebrate the tasks you have completed.",
    Pending: "Focus on the tasks that need your attention.",
  };

  return (
    <header className="navbar">
      <div className="navbar-heading">
        <p className="navbar-label">YOUR PERSONAL WORKSPACE</p>
        <h2>{activePage}</h2>
        <p className="navbar-description">
          {descriptions[activePage]}
        </p>
      </div>

      <div className="navbar-actions">
        <div className="search-box">
          <Search size={19} />
          <input
            type="search"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
          />
          {searchTerm && (
            <button onClick={() => onSearch("")} type="button">
              <X size={17} />
            </button>
          )}
        </div>

        <button className="notification-button" title="Notifications">
          <Bell size={21} />
        </button>

        <div className="productivity-label">
          <Sparkles size={19} />
          <span>{username}</span>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
