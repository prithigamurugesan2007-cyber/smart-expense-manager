
<?php
$currentPage = basename($_SERVER['PHP_SELF']);

$navItems = array(
    array('index.php', 'Dashboard', '⌂'),
    array('transactions.php', 'Transactions', '↔'),
    array('income.php', 'Income', '↗'),
    array('expenses.php', 'Expenses', '↘'),
    array('budgets.php', 'Budgets', '▤'),
    array('savings.php', 'Savings Goals', '☆'),
    array('reports.php', 'Reports', '▥'),
    array('settings.php', 'Settings', '⚙')
);
?>

<aside class="sidebar" id="sidebar">
    <a class="brand" href="index.php">
        <span class="brand-mark">✳</span>
        <span>Smart<span class="brand-light">Expense</span>
            <small>PERSONAL FINANCE</small>
        </span>
    </a>

    <div class="nav-caption">WORKSPACE</div>

    <nav>
        <?php
        foreach ($navItems as $item) {
            $active = '';

            if ($currentPage == $item[0]) {
                $active = 'active';
            }

            echo '<a class="nav-link ' . $active .
                 '" href="' . htmlspecialchars($item[0]) . '">';

            echo '<span class="nav-icon">' . $item[2] . '</span>';
            echo '<span>' . htmlspecialchars($item[1]) . '</span>';
            echo '</a>';
        }
        ?>
    </nav>

    <div class="sidebar-bottom">
        <div class="avatar">AM</div>
        <div>
            <strong>Alex Morgan</strong>
            <small>Personal Finance</small>
        </div>
        <span class="dots">•••</span>
    </div>
</aside>
