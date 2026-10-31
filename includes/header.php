
<?php
$pageTitles = array(
    'index.php' => 'Dashboard',
    'transactions.php' => 'Transactions',
    'income.php' => 'Income',
    'expenses.php' => 'Expenses',
    'budgets.php' => 'Budgets',
    'savings.php' => 'Savings Goals',
    'reports.php' => 'Reports & Analytics',
    'settings.php' => 'Settings'
);

$currentFile = basename($_SERVER['PHP_SELF']);
$pageTitle = isset($pageTitles[$currentFile])
    ? $pageTitles[$currentFile]
    : 'Dashboard';
?>

<header class="topbar">
    <button class="mobile-menu" id="mobileMenu" aria-label="Open menu">☰</button>

    <div class="crumb">
        <span>Workspace</span>
        <b>/</b>
        <strong><?php echo htmlspecialchars($pageTitle); ?></strong>
    </div>

    <div class="top-actions">
        <span class="demo-pill"><i></i> Demo data</span>
        <button class="icon-btn" id="notifications" title="Notifications">♧</button>
        <div class="avatar small-avatar">AM</div>
    </div>
</header>
