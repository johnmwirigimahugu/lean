<?php
/**
 * ─────────────────────────────────────────────────────────────────────────────
 * 🦾 Lean.php v3.16 - Universal Enterprise-Grade PHP Microframework
 * UUID::8d0a4f6d-1176-4d8e-8c35-fdd96e4a1399
 * 🕒 Generated: 2025-09-07 08:08 EAT
 *
 * 🧾 Copyright © 2025 John Kesh Mahugu (johnmahugu@gmail.com) & Contributors
 * 🔑 License: MIT (see https://opensource.org/licenses/MIT)
 *
 * 📘 INTRODUCTION:
 * Lean.php (from "umoja" - unity) is an all-in-one, zero-dependency PHP microframework,
 * designed for rapid, robust, and portable business app development. It features a JSON-based
 * database, enterprise-grade authentication, RBAC/ACL, minimal templating, and automatic
 * bootstrapping on both Apache and NGINX. Move it to any folder, and it just works!
 *
 * 🛣️ FEATURES:
 * - 🔹 Self-bootstrapping: auto-generates .htaccess and nginx.conf for subfolder support
 * - 🔹 Pretty URLs: index.php/route, works in any subfolder
 * - 🔹 SleekDB-style JSON database (MojaDB): no SQL, no PDO, just JSON
 * - 🔹 Enterprise Authentication (MojaUser): registration, login, ACL, roles, secure sessions
 * - 🔹 Minimal templating: inline or file-based, with auto-escaping
 * - 🔹 Modern Request/Response objects, middleware, and hooks
 * - 🔹 Portable: Drop into any folder/subfolder, works out of the box
 * - 🔹 Zero external dependencies
 * - 🔹 MIT Licensed: Commercial and personal use welcome
 *
 * 📜 ROADMAP:
 * - [x] Apache/NGINX auto-bootstrap
 * - [x] SleekDB-style JSON DB
 * - [x] Full user/role management and ACL
 * - [x] Minimal but robust templating
 * - [x] Portable URL generator
 * - [ ] Admin panel generator (planned)
 * - [ ] Universal API (OpenAPI/REST/JSON) (planned)
 *
 * 🙏 DEDICATION:
 * To everyone who uses this code: may you build with joy, clarity, and unity (אחדות).
 * And to יהוה, the Holy One of Israel, whose wisdom and unity inspire all creation.
 * ─────────────────────────────────────────────────────────────────────────────
 */
/**
 * Lean.php v3.16 - Enterprise Micro-Framework for PHP (SleekDB, Auth, ACL, Templating)
 * ============================================================================
 * - Pretty URLs (/index.php/route), .htaccess auto-bootstrap
 * - SleekDB-style JSON database (LeanDB)
 * - Enterprise-grade User/Auth/ACL (LeanUser)
 * - Minimal templating (LeanTemplate)
 * - Modern request/response, middleware, hooks
 * - MIT License - John "Kesh" Mahugu 2025
 */

// --- Self-bootstrap .htaccess & folders ---
(function() {
    $baseDir = __DIR__;
    $folders = ['views', 'data', 'cache', 'logs', 'data/users'];
    $htaccessFile = $baseDir . '/.htaccess';
    $nginxFile = $baseDir . '/nginx.conf.snippet';

    // Dynamically detect the subdirectory name (e.g. 'Lean', 'cms', etc.)
    $baseDirName = trim(str_replace('\\','/', $baseDir), '/');
    $parts = explode('/', $baseDirName);
    $subfolder = end($parts);

    // Compose Apache .htaccess contents with dynamic folder
    $htaccessContents = <<<HT
# Lean.php .htaccess for pretty URLs and index.php redirect
DirectoryIndex index.php
RewriteEngine On

# Redirect /$subfolder/ to /$subfolder/index.php
RewriteCond %{REQUEST_URI} /$subfolder/?\$
RewriteRule ^\$ index.php [R=302,L]

RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)\$ index.php [QSA,L]
HT;

    // Compose NGINX config snippet with dynamic folder
    $nginxContents = <<<NGX
# Lean.php NGINX config snippet
location /$subfolder/ {
    index index.php;
    try_files \$uri \$uri/ /$subfolder/index.php\$is_args\$args;
}
location = /$subfolder/ {
    return 302 /$subfolder/index.php;
}
NGX;

    // Create missing folders
    foreach ($folders as $folder) {
        $fpath = $baseDir . '/' . $folder;
        if (!is_dir($fpath)) @mkdir($fpath, 0755, true);
    }
    // Write .htaccess if missing
    if (!file_exists($htaccessFile)) file_put_contents($htaccessFile, $htaccessContents);
    // Write nginx.conf.snippet always (or only if missing: add !file_exists($nginxFile) if preferred)
    file_put_contents($nginxFile, $nginxContents);
})();

//--- dynamic urls by kesh --
function Lean_url($path = '') {
    $base = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/');
    return $base . '/index.php' . ($path ? '/' . ltrim($path, '/') : '');
}

// --- Request ---
class LeanRequest {
    public $params = [], $query, $body, $method, $path;
    public function __construct() {
        $this->query = $_GET;
        $this->method = $_SERVER['REQUEST_METHOD'];
        $this->body = $_POST ?: json_decode(file_get_contents('php://input'), true) ?: [];
        $this->path = $this->detectPath();
    }
    private function detectPath() {
        $uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
        $script = $_SERVER['SCRIPT_NAME'];
        if (strpos($uri, $script) === 0) {
            $route = (string)substr($uri, strlen($script));
            if ($route === '' || $route === false) $route = '/';
            if ($route !== '/' && str_ends_with($route, '/')) $route = rtrim($route, '/');
        } else {
            $route = $this->query['p'] ?? $uri;
        }
        return $route ?: '/';
    }
    public function input($key, $default = null) {
        return $this->body[$key] ?? $this->query[$key] ?? $default;
    }
}

// --- Response ---
class LeanResponse {
    public $status = 200, $headers = ['Content-Type' => 'text/html'], $body = '';
    public function status($code) { $this->status = $code; return $this; }
    public function json($data) {
        $this->headers['Content-Type'] = 'application/json';
        $this->body = json_encode($data); return $this;
    }
    public function send() {
        http_response_code($this->status);
        foreach ($this->headers as $k => $v) header("$k: $v");
        echo $this->body;
        exit;
    }
}

// --- SleekDB-like JSON DB ---
class LeanDB {
    private $storeName, $storePath, $filePath, $indexPath, $data = [], $dataLoaded = false;
    private $wheres = [], $limit = null, $skip = 0, $orderBy = null, $indexes = [], $indexesLoaded = false;
    private $inMemory = false;

    public function __construct($storeName, $storePath = null) {
        $this->storeName = $storeName;
        $this->storePath = $storePath ? rtrim($storePath, '/') : sys_get_temp_dir();
        $this->filePath = "$this->storePath/$storeName.json";
        $this->indexPath = "$this->storePath/{$storeName}_indexes.json";
        if (!$this->initDir($this->storePath)) $this->inMemory = true;
    }
    private function initDir($dir) {
        if (is_dir($dir) && is_writable($dir)) return true;
        return @mkdir($dir, 0755, true) && is_writable($dir);
    }
    public function insert($doc) {
        $this->loadData();
        $doc['_id'] = $this->generateId();
        $this->data[] = $doc;
        $this->updateIndexes($doc, 'insert');
        $this->saveData();
        return $doc;
    }
    public function insertMany($docs) {
        $inserted = [];
        foreach ($docs as $doc) $inserted[] = $this->insert($doc);
        return $inserted;
    }
    public function where($field, $op, $val) {
        $this->wheres[] = ['field' => $field, 'operator' => $op, 'value' => $val];
        return $this;
    }
    public function limit($n) { $this->limit = $n; return $this; }
    public function skip($n) { $this->skip = max(0, $n); return $this; }
    public function orderBy($field, $dir = 'asc') {
        $this->orderBy = ['field' => $field, 'direction' => strtolower($dir)];
        return $this;
    }
    public function fetch() {
        $this->loadData();
        $results = $this->matches();
        if ($this->orderBy) usort($results, fn($a, $b) => $this->compareSort($a, $b));
        $results = array_slice($results, $this->skip, $this->limit);
        $this->wheres = []; $this->limit = null; $this->skip = 0; $this->orderBy = null;
        return $results;
    }
    public function update($id, $data) {
        $this->loadData();
        $index = array_search($id, array_column($this->data, '_id'));
        if ($index === false) return false;
        $oldDoc = $this->data[$index];
        $this->data[$index] = array_merge($this->data[$index], $data);
        $this->updateIndexes($this->data[$index], 'update', $oldDoc);
        $this->saveData();
        return true;
    }
    public function delete($id) {
        $this->loadData();
        $index = array_search($id, array_column($this->data, '_id'));
        if ($index === false) return false;
        $this->updateIndexes($this->data[$index], 'delete');
        array_splice($this->data, $index, 1);
        $this->saveData();
        return true;
    }
    private function loadData() {
        if ($this->dataLoaded || $this->inMemory) return;
        $this->data = file_exists($this->filePath) ? json_decode(file_get_contents($this->filePath), true) ?: [] : [];
        $this->dataLoaded = true;
    }
    private function saveData() {
        if ($this->inMemory) return;
        @file_put_contents($this->filePath, json_encode($this->data, JSON_PRETTY_PRINT), LOCK_EX);
    }
    private function loadIndexes() {
        if ($this->indexesLoaded || $this->inMemory) return;
        $this->indexes = file_exists($this->indexPath) ? json_decode(file_get_contents($this->indexPath), true) ?: [] : [];
        $this->indexesLoaded = true;
    }
    private function saveIndexes() {
        if ($this->inMemory) return;
        @file_put_contents($this->indexPath, json_encode($this->indexes, JSON_PRETTY_PRINT), LOCK_EX);
    }
    public function createIndex($fields) {
        $this->loadData();
        $this->loadIndexes();
        $key = is_array($fields) ? implode('|', $fields) : $fields;
        if (isset($this->indexes[$key])) return;
        $indexData = [];
        foreach ($this->data as $doc) {
            $val = $this->getCompositeIndexValue($doc, $fields);
            if ($val !== null) $indexData[$val][] = $doc['_id'];
        }
        $this->indexes[$key] = ['fields' => (array)$fields, 'map' => $indexData];
        $this->saveIndexes();
    }
    private function generateId() {
        $data = random_bytes(16);
        $data[6] = chr(ord($data[6]) & 0x0f | 0x40);
        $data[8] = chr(ord($data[8]) & 0x3f | 0x80);
        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
    }
    private function getValue($array, $key) {
        foreach (explode('.', $key) as $k) {
            if (!is_array($array) || !isset($array[$k])) return null;
            $array = $array[$k];
        }
        return $array;
    }
    private function compare($a, $op, $b) {
        switch ($op) {
            case '=': return $a == $b;
            case '!=': return $a != $b;
            case '<': return $a < $b;
            case '<=': return $a <= $b;
            case '>': return $a > $b;
            case '>=': return $a >= $b;
            default: throw new InvalidArgumentException("Invalid operator: $op");
        }
    }
    private function matches() {
        $results = [];
        foreach ($this->data as $doc) {
            $match = true;
            foreach ($this->wheres as $w) {
                if (!$this->compare($this->getValue($doc, $w['field']), $w['operator'], $w['value'])) {
                    $match = false; break;
                }
            }
            if ($match) $results[] = $doc;
        }
        return $results;
    }
    private function compareSort($a, $b) {
        $valA = $this->getValue($a, $this->orderBy['field']);
        $valB = $this->getValue($b, $this->orderBy['field']);
        $dir = $this->orderBy['direction'] === 'asc' ? 1 : -1;
        return ($valA <=> $valB) * $dir;
    }
    private function updateIndexes($doc, $op, $oldDoc = null) {
        $this->loadIndexes();
        foreach ($this->indexes as &$index) {
            if ($op === 'insert') {
                $key = $this->getCompositeIndexValue($doc, $index['fields']);
                if ($key !== null) $index['map'][$key][] = $doc['_id'];
            } elseif ($op === 'update') {
                $oldKey = $this->getCompositeIndexValue($oldDoc, $index['fields']);
                $newKey = $this->getCompositeIndexValue($doc, $index['fields']);
                if ($oldKey !== $newKey) {
                    if ($oldKey && isset($index['map'][$oldKey])) {
                        $index['map'][$oldKey] = array_filter($index['map'][$oldKey], fn($id) => $id !== $doc['_id']);
                        if (empty($index['map'][$oldKey])) unset($index['map'][$oldKey]);
                    }
                    if ($newKey) $index['map'][$newKey][] = $doc['_id'];
                }
            } elseif ($op === 'delete') {
                $key = $this->getCompositeIndexValue($doc, $index['fields']);
                if ($key && isset($index['map'][$key])) {
                    $index['map'][$key] = array_filter($index['map'][$key], fn($id) => $id !== $doc['_id']);
                    if (empty($index['map'][$key])) unset($index['map'][$key]);
                }
            }
        }
        $this->saveIndexes();
    }
    private function getCompositeIndexValue($doc, $fields) {
        $values = [];
        foreach ((array)$fields as $f) {
            $val = $this->getValue($doc, $f);
            if ($val === null) return null;
            $values[] = is_scalar($val) ? (string)$val : json_encode($val);
        }
        return implode('|', $values);
    }
}

// --- Minimal templating ---
class LeanTemplate {
    private $templateDir, $cacheDir, $autoEscape;
    public function __construct($templateDir = null, $cacheDir = null, $autoEscape = true) {
        $this->templateDir = $templateDir ? rtrim($templateDir, '/') . '/' : sys_get_temp_dir() . '/';
        $this->cacheDir = $cacheDir ? rtrim($cacheDir, '/') . '/' : sys_get_temp_dir() . '/';
        $this->autoEscape = $autoEscape;
        $this->initDir($this->templateDir);
        $this->initDir($this->cacheDir);
    }
    private function initDir($dir) {
        if (!$dir || $dir === sys_get_temp_dir() . '/') return true;
        if (is_dir($dir) && is_writable($dir)) return true;
        return @mkdir($dir, 0755, true) && is_writable($dir);
    }
    public function render($template, $vars = []) {
        $compiled = $this->compile($template);
        extract($vars, EXTR_SKIP);
        ob_start();
        include $compiled;
        return ob_get_clean();
    }
    public function renderString($source, $vars = []) {
        $compiled = $this->parse($source, 'string');
        $tmpFile = $this->cacheDir . 'Lean_string_' . md5($source) . '.php';
        file_put_contents($tmpFile, $compiled);
        extract($vars, EXTR_SKIP);
        ob_start();
        include $tmpFile;
        return ob_get_clean();
    }
    private function compile($template) {
        $path = $this->templateDir . $template;
        if (!is_readable($path)) return $this->parse('', $template);
        $cacheFile = $this->cacheDir . str_replace(['/', '\\'], '_', $template) . '.php';
        if (!file_exists($cacheFile) || filemtime($path) > filemtime($cacheFile)) {
            $source = file_get_contents($path);
            file_put_contents($cacheFile, $this->parse($source, $template));
        }
        return $cacheFile;
    }
    private function parse($source, $path) {
        $esc = $this->autoEscape ? 'htmlspecialchars' : 'strval';
        return preg_replace_callback('/\{\{\s*(.+?)\s*\}\}/', function($m) use ($esc) {
            $var = '$' . trim($m[1]);
            return "<?php echo $esc($var); ?>";
        }, $source);
    }
}

// --- Enterprise User/Auth/ACL (LeanUser) using LeanDB ---
class LeanUser {
    const USER_STORE = 'users';
    const USER_DATA_DIR = './data/users';
    const SESSION_TIMEOUT = 1800;
    const REMEMBER_COOKIE_TIMEOUT = 31536000;
    const DOMAIN = 'localhost';
    const MAIL_FROM = 'noreply@localhost';
    const MAIL_REPLY = 'noreply@localhost';
    const USE_MAIL = false;
    const ROLES = ['guest', 'pending', 'user', 'moderator', 'admin'];

    private $db, $user, $authenticated = false, $info = [], $error = [];

    public function __construct() {
        $this->db = new LeanDB(self::USER_STORE, self::USER_DATA_DIR);
        if (session_status() === PHP_SESSION_NONE) {
            session_name(self::DOMAIN . '_LeanUserSess');
            session_start();
        }
        if (!empty($_SESSION['user_id'])) {
            $this->authenticated = $this->authBySession();
        } elseif (!empty($_COOKIE[self::DOMAIN . '_LeanUserID']) && !empty($_COOKIE[self::DOMAIN . '_LeanUserToken'])) {
            $this->authenticated = $this->authByRememberMe();
        }
        if (!$this->authenticated) $this->user = null;
    }
    public function register($username, $email, $password, $role = 'user') {
        $username = trim($username);
        $email = trim($email);
        if (!$this->validUsername($username)) return false;
        if (!$this->validEmail($email)) return false;
        if (strlen($password) < 8) return $this->err("Password too short (min 8 chars)");
        if ($this->db->where('username', '=', $username)->fetch()) return $this->err("Username already exists");
        if ($this->db->where('email', '=', $email)->fetch()) return $this->err("Email already exists");
        $hash = password_hash($password, PASSWORD_DEFAULT);
        $token = $this->random(64);
        $user = [
            'username' => $username,
            'email' => $email,
            'password' => $hash,
            'role' => $role,
            'status' => self::USE_MAIL ? 'pending' : $role,
            'session_token' => null,
            'remember_token' => $token,
            'created' => time(),
            'updated' => time(),
            'last_active' => time(),
            'meta' => []
        ];
        $this->db->insert($user);
        $this->info("User registered: $username ($email)");
        if (self::USE_MAIL) $this->sendMail($email, "Registration", "Welcome $username! Activate your account.");
        return true;
    }
    public function login($user, $password, $remember = false) {
        $u = $this->db->where('username', '=', $user)->fetch();
        if (!$u) $u = $this->db->where('email', '=', $user)->fetch();
        if (!$u) return $this->err("User not found");
        $u = $u[0];
        if (!password_verify($password, $u['password'])) return $this->err("Invalid password");
        if ($u['status'] === 'pending') return $this->err("Account pending activation");
        $token = $this->random(32);
        $this->db->update($u['_id'], ['session_token' => $token, 'last_active' => time()]);
        $this->user = array_merge($u, ['session_token' => $token, 'last_active' => time()]);
        $this->authenticated = true;
        $_SESSION['user_id'] = $u['_id'];
        $_SESSION['session_token'] = $token;
        $_SESSION['last_active'] = time();
        if ($remember) {
            $rtoken = $this->random(64);
            $this->db->update($u['_id'], ['remember_token' => $rtoken]);
            setcookie(self::DOMAIN . '_LeanUserID', $u['_id'], time() + self::REMEMBER_COOKIE_TIMEOUT, '/', '.' . self::DOMAIN, false, true);
            setcookie(self::DOMAIN . '_LeanUserToken', $rtoken, time() + self::REMEMBER_COOKIE_TIMEOUT, '/', '.' . self::DOMAIN, false, true);
        }
        $this->info("User logged in: {$u['username']}");
        return true;
    }
    public function logout() {
        if ($this->user && isset($this->user['_id'])) {
            $uid = $this->user['_id'];
            $this->db->update($uid, ['session_token' => null, 'remember_token' => null]);
        }
        $_SESSION = [];
        session_destroy();
        setcookie(self::DOMAIN . '_LeanUserID', '', time() - 3600, '/', '.' . self::DOMAIN, false, true);
        setcookie(self::DOMAIN . '_LeanUserToken', '', time() - 3600, '/', '.' . self::DOMAIN, false, true);
        $this->authenticated = false;
        $this->user = null;
        $this->info("User logged out");
        return true;
    }
    public function update($email = null, $password = null) {
        if (!$this->user || !isset($this->user['_id'])) return $this->err("Not logged in");
        $uid = $this->user['_id'];
        $update = [];
        if ($email && $this->validEmail($email)) $update['email'] = $email;
        if ($password && strlen($password) >= 8) $update['password'] = password_hash($password, PASSWORD_DEFAULT);
        if ($update) {
            $update['updated'] = time();
            $this->db->update($uid, $update);
            $this->info("User profile updated");
        }
        return !!$update;
    }
    public function resetPassword($email) {
        if (!self::USE_MAIL) return $this->err("Mail not enabled");
        $u = $this->db->where('email', '=', $email)->fetch();
        if (!$u) return $this->err("No account with that email");
        $u = $u[0];
        $pw = $this->random(12);
        $this->db->update($u['_id'], ['password' => password_hash($pw, PASSWORD_DEFAULT), 'updated' => time()]);
        $this->sendMail($email, "Password Reset", "Your new password: $pw");
        $this->info("Password reset for {$u['username']}");
        return true;
    }
    public function setRole($id, $role) {
        if (!$this->isAdmin()) return $this->err("Only admin can set roles");
        $u = $this->db->where('_id', '=', $id)->fetch();
        if (!$u) return $this->err("No such user");
        $this->db->update($id, ['role' => $role, 'updated' => time()]);
        $this->info("Role set for user $id to $role");
        return true;
    }
    public function hasRole($role) {
        $hier = array_flip(self::ROLES);
        if (!$this->user) return $role === 'guest';
        return $hier[$this->user['role']] >= $hier[$role];
    }
    public function isGuest() { return !$this->user || $this->user['role'] === 'guest'; }
    public function isUser() { return $this->hasRole('user'); }
    public function isModerator() { return $this->hasRole('moderator'); }
    public function isAdmin() { return $this->hasRole('admin'); }
    public function getUser() { return $this->user; }
    public function getId() { return $this->user['_id'] ?? null; }
    public function getUsername() { return $this->user['username'] ?? null; }
    public function getEmail() { return $this->user['email'] ?? null; }
    public function getRoleName() { return $this->user['role'] ?? 'guest'; }
    public function getInfo() { return $this->info; }
    public function getErrors() { return $this->error; }
    public function isAuthenticated() { return $this->authenticated; }
    // --- Internals ---
    private function authBySession() {
        $id = $_SESSION['user_id'] ?? null;
        $token = $_SESSION['session_token'] ?? null;
        $last = $_SESSION['last_active'] ?? 0;
        $u = $this->db->where('_id', '=', $id)->fetch();
        if (!$id || !$token || !$u) return false;
        $user = $u[0];
        if ($user['session_token'] !== $token) return false;
        if (time() - $last > self::SESSION_TIMEOUT) return false;
        $this->db->update($id, ['last_active' => time()]);
        $_SESSION['last_active'] = time();
        $this->user = $user;
        return true;
    }
    private function authByRememberMe() {
        $id = $_COOKIE[self::DOMAIN . '_LeanUserID'] ?? null;
        $token = $_COOKIE[self::DOMAIN . '_LeanUserToken'] ?? null;
        $u = $this->db->where('_id', '=', $id)->fetch();
        if (!$id || !$token || !$u) return false;
        $user = $u[0];
        if ($user['remember_token'] !== $token) return false;
        $this->db->update($id, ['session_token' => $token, 'last_active' => time()]);
        $_SESSION['user_id'] = $id;
        $_SESSION['session_token'] = $token;
        $_SESSION['last_active'] = time();
        $this->user = $user;
        $this->authenticated = true;
        return true;
    }
    private function validUsername($u) {
        if (preg_match('/^[a-zA-Z0-9_.-]{3,30}$/', $u)) return true;
        $this->err("Invalid username"); return false;
    }
    private function validEmail($e) {
        if (filter_var($e, FILTER_VALIDATE_EMAIL)) return true;
        $this->err("Invalid email"); return false;
    }
    private function random($n) { return bin2hex(random_bytes($n/2)); }
    private function sendMail($to, $subject, $body) {
        if (!self::USE_MAIL) return false;
        $headers = "From: " . self::MAIL_FROM . "\r\n";
        $headers .= "Reply-To: " . self::MAIL_REPLY . "\r\n";
        $headers .= "X-Mailer: PHP/" . phpversion();
        $headers .= "MIME-Version: 1.0\r\n";
        $headers .= "Content-type: text/plain; charset=UTF-8\r\n";
        return mail($to, $subject, $body, $headers);
    }
    private function info($msg) { $this->info[] = $msg; }
    private function err($msg) { $this->error[] = $msg; return false; }
}

// --- Main Lean Framework ---
class Lean {
    private static $instance;
    private $config = [
        'view_dir' => __DIR__.'/views',
        'cache_dir' => __DIR__.'/cache',
        'db_dir' => __DIR__.'/data',
        'auto_escape' => true,
        'spa' => false,
        'log_dir' => __DIR__.'/logs',
        'debug' => false
    ];
    private $router, $template, $hooks = [], $dbs = [], $auth;

    private function __construct() {
        $this->router = new class {
            private $routes = [], $mws = [];
            public function get($path, $fn) { $this->routes['GET'][$path] = $fn; }
            public function post($path, $fn) { $this->routes['POST'][$path] = $fn; }
            public function mw($fn) { $this->mws[] = $fn; }
            public function dispatch($req, $res) {
                $uri = $req->path;
                $method = $req->method;
                foreach ($this->mws as $mw) {
                    if (call_user_func($mw, $req, $res) === false) {
                        $res->status(403)->json(['error' => 'Forbidden'])->send();
                        return;
                    }
                }
                foreach ($this->routes[$method] ?? [] as $route => $fn) {
                    $pattern = preg_replace('#\{([^/]+)\}#', '(?P<\1>[^/]+)', $route);
                    if (preg_match("#^$pattern$#", $uri, $m)) {
                        $req->params = array_filter($m, 'is_string', ARRAY_FILTER_USE_KEY);
                        $out = call_user_func($fn, $req, $res);
                        if (is_string($out)) $res->body = $out;
                        elseif (is_array($out)) $res->json($out);
                        $res->send();
                        return;
                    }
                }
                $res->status(404)->json(['error' => 'Not Found'])->send();
            }
        };
        session_start();
        $this->template = new LeanTemplate(
            $this->config['view_dir'],
            $this->config['cache_dir'],
            $this->config['auto_escape']
        );
        $this->router->get('/', fn($req, $res) => Lean::view_string(
            '<h1>Welcome to Lean.php v3.16!</h1><p>Enterprise micro-framework by John "Kesh" Mahugu.</p>',
            []
        ));
    }
    public static function instance() { return self::$instance ??= new self(); }
    public static function view_dir($dir) { return self::config(['view_dir' => $dir]); }
    public static function cache_dir($dir) { return self::config(['cache_dir' => $dir]); }
    public static function db_dir($dir) { return self::config(['db_dir' => $dir]); }
    public static function config($cfg = []) {
        $i = self::instance();
        $i->config = array_merge($i->config, $cfg);
        $i->template = new LeanTemplate($i->config['view_dir'], $i->config['cache_dir'], $i->config['auto_escape']);
        return $i->config;
    }
    public static function get($path, $fn) { self::instance()->router->get($path, $fn); }
    public static function post($path, $fn) { self::instance()->router->post($path, $fn); }
    public static function mw($fn) { self::instance()->router->mw($fn); }
    public static function db($store) {
        $i = self::instance();
        return $i->dbs[$store] ??= new LeanDB($store, $i->config['db_dir']);
    }
    public static function view($tpl, $data = []) {
        $i = self::instance();
        $i->trigger('before_view', [$tpl, &$data]);
        $out = $i->config['spa'] || isset($_GET['json']) ? json_encode($data) : $i->template->render($tpl, $data);
        $i->trigger('after_view', [&$out]);
        return $out;
    }
    public static function view_string($tplString, $data = []) {
        $i = self::instance();
        $i->trigger('before_view', ['string', &$data]);
        $out = $i->config['spa'] || isset($_GET['json']) ? json_encode($data) : $i->template->renderString($tplString, $data);
        $i->trigger('after_view', [&$out]);
        return $out;
    }
    public static function run() {
        $i = self::instance();
        $req = new LeanRequest();
        $res = new LeanResponse();
        $i->trigger('before_run', [$req, $res]);
        $i->router->dispatch($req, $res);
        $i->trigger('after_run', [$req, $res]);
    }
    public static function extend($name, $fn) {
        $i = self::instance();
        $i->trigger('before_extend', [$name]);
        call_user_func($fn, $i);
        $i->trigger('after_extend', [$name]);
    }
    public static function hook($event, $fn) { self::instance()->hooks[$event][] = $fn; }
    private function trigger($event, $args = []) {
        foreach ($this->hooks[$event] ?? [] as $fn) call_user_func_array($fn, $args);
    }
    public static function user() { return self::instance()->auth ??= new LeanUser(); }
    public static function log($msg) {
        $i = self::instance();
        $logDir = $i->config['log_dir'] ?? sys_get_temp_dir();
        if ($i->initDir($logDir)) {
            file_put_contents("$logDir/app.log", date('Y-m-d H:i:s') . " - $msg\n", FILE_APPEND);
        } else {
            error_log("Lean: $msg");
        }
        if ($i->config['debug']) echo "<pre>Log: $msg</pre>";
    }
    private function initDir($dir) {
        if (!$dir) return false;
        if (is_dir($dir) && is_writable($dir)) return true;
        return @mkdir($dir, 0755, true) && is_writable($dir);
    }
}

// ... (rest of your Lean.php framework code above)

// --- ADMIN AUTH HELPERS ---
function getAdminPasswordPath() {
    return __DIR__ . '/data/admin_password.json';
}

function isAdminPasswordSet() {
    return file_exists(getAdminPasswordPath());
}

function verifyAdminPassword($password) {
    $hash = @file_get_contents(getAdminPasswordPath());
    return password_verify($password, $hash ?: '');
}

function setAdminPassword($password) {
    $hash = password_hash($password, PASSWORD_DEFAULT);
    if (!is_dir(__DIR__.'/data')) mkdir(__DIR__.'/data', 0755, true);
    file_put_contents(getAdminPasswordPath(), $hash, LOCK_EX);
}

function adminIsLoggedIn() {
    if (session_status() == PHP_SESSION_NONE) session_start();
    return $_SESSION['admin_logged_in'] ?? false;
}

function adminLogin() {
    if (session_status() == PHP_SESSION_NONE) session_start();
    $_SESSION['admin_logged_in'] = true;
}

function adminLogout() {
    if (session_status() == PHP_SESSION_NONE) session_start();
    $_SESSION['admin_logged_in'] = false;
}

// --- ADMIN ROUTES ---

// Set password or redirect to login/dashboard
Lean::get('/manage', function($req, $res) {
    if (!isAdminPasswordSet()) {
        return Lean::view_string('
            <h1>Set Admin Password</h1>
            <form method="post" action="/manage/set-password">
                <input type="password" name="password" required minlength="6" placeholder="New Admin Password">
                <button>Set Password</button>
            </form>
        ');
    }
    if (!adminIsLoggedIn()) {
        header('Location: /manage/login');
        exit;
    }
    header('Location: /manage/dashboard');
    exit;
});

Lean::post('/manage/set-password', function($req, $res) {
    $password = $req->input('password');
    if (!$password || strlen($password) < 6) {
        return Lean::view_string('<p>Password must be at least 6 characters.</p><a href="/manage">Back</a>');
    }
    setAdminPassword($password);
    adminLogin();
    header('Location: /manage/dashboard');
    exit;
});

// Admin login form
Lean::get('/manage/login', function() {
    if (adminIsLoggedIn()) {
        header('Location: /manage/dashboard');
        exit;
    }
    return Lean::view_string('
        <h1>Admin Login</h1>
        <form method="post" action="/manage/login">
            <input type="password" name="password" required placeholder="Admin Password">
            <button>Login</button>
        </form>
    ');
});

Lean::post('/manage/login', function($req) {
    $password = $req->input('password');
    if (verifyAdminPassword($password)) {
        adminLogin();
        header('Location: /manage/dashboard');
        exit;
    }
    return Lean::view_string('<p>Invalid password.</p><a href="/manage/login">Try again</a>');
});

// Admin logout
Lean::get('/manage/logout', function() {
    adminLogout();
    return 'Logged out. <a href="/manage/login">Login</a>';
});

// Admin dashboard - list stores (excluding admin_password file)
Lean::get('/manage/dashboard', function() {
    if (!adminIsLoggedIn()) {
        header('Location: /manage/login');
        exit;
    }
    $storesDir = __DIR__ . '/data';
    $files = glob("$storesDir/*.json");
    $stores = [];
    foreach ($files as $f) {
        $store = basename($f, '.json');
        if ($store !== 'admin_password') $stores[] = $store;
    }
    $links = '';
    foreach ($stores as $s) {
        $links .= "<li><a href='/manage/$s'>" . htmlspecialchars($s) . "</a></li>";
    }
    return Lean::view_string("
        <h1>Admin Dashboard</h1>
        <p><a href='/manage/logout'>Logout</a></p>
        <h2>Manage Data Stores</h2>
        <ul>$links</ul>
    ");
});

// Middleware to protect all /manage/* routes except login & set-password
Lean::mw(function($req, $res) {
    $path = $req->path;
    if (str_starts_with($path, '/manage')) {
        if (in_array($path, ['/manage/login', '/manage/set-password', '/manage'])) {
            return true; // allow open
        }
        if (!adminIsLoggedIn()) {
            $res->status(302);
            header('Location: /manage/login');
            exit;
        }
    }
    return true;
});

// Generic CRUD list
Lean::get('/manage/{store}', function($req) {
    $store = $req->params['store'];
    $db = Lean::db($store);
    $items = $db->fetch();
    $headers = [];
    if (count($items) > 0) $headers = array_keys($items[0]);
    $rows = '';
    foreach ($items as $item) {
        $cells = '';
        foreach ($headers as $h) {
            $value = $item[$h] ?? '';
            $cells .= '<td>' . htmlspecialchars(is_scalar($value) ? (string)$value : json_encode($value)) . '</td>';
        }
        $id = $item['_id'] ?? '';
        $rows .= "<tr>$cells
            <td><a href='/manage/$store/edit?id=$id'>Edit</a> |
            <a href='/manage/$store/delete?id=$id' onclick='return confirm(\"Delete?\")'>Delete</a></td>
        </tr>";
    }
    $headerRow = '';
    foreach ($headers as $h) {
        $headerRow .= '<th>' . htmlspecialchars($h) . '</th>';
    }
    $headerRow .= '<th>Actions</th>';
    return Lean::view_string("
        <h1>Manage " . htmlspecialchars($store) . "</h1>
        <p><a href='/manage/dashboard'>Dashboard</a> | <a href='/manage/$store/add'>Add New</a></p>
        <table border='1' cellpadding='5' cellspacing='0'>
            <thead><tr>$headerRow</tr></thead>
            <tbody>$rows</tbody>
        </table>
    ");
});

// Add new form (JSON textarea)
Lean::get('/manage/{store}/add', function($req) {
    $store = $req->params['store'];
    return Lean::view_string("
        <h1>Add new item to $store</h1>
        <form method='post' action='/manage/$store/add'>
        <textarea name='jsondata' rows='10' cols='50'>{}</textarea><br>
        <button>Add</button>
        </form>
        <p><a href='/manage/$store'>Back to list</a></p>
    ");
});

Lean::post('/manage/{store}/add', function($req) {
    $store = $req->params['store'];
    $db = Lean::db($store);
    $jsondata = trim($req->input('jsondata'));
    $data = json_decode($jsondata, true);
    if (!$data || !is_array($data)) {
        return "Invalid JSON data. <a href='/manage/$store/add'>Try Again</a>";
    }
    $db->insert($data);
    header("Location: /manage/$store");
    exit;
});

// Edit form
Lean::get('/manage/{store}/edit', function($req) {
    $store = $req->params['store'];
    $id = $req->query['id'] ?? '';
    $db = Lean::db($store);
    $items = $db->where('_id', '=', $id)->fetch();
    if (!$items) return "Item not found. <a href='/manage/$store'>Back</a>";
    $item = $items[0];
    $jsondata = json_encode($item, JSON_PRETTY_PRINT);
    return Lean::view_string("
        <h1>Edit item in $store</h1>
        <form method='post' action='/manage/$store/edit?id=$id'>
        <textarea name='jsondata' rows='10' cols='50'>" . htmlspecialchars($jsondata) . "</textarea><br>
        <button>Update</button>
        </form>
        <p><a href='/manage/$store'>Back to list</a></p>
    ");
});

Lean::post('/manage/{store}/edit', function($req) {
    $store = $req->params['store'];
    $id = $req->query['id'] ?? '';
    $db = Lean::db($store);
    $jsondata = trim($req->input('jsondata'));
    $data = json_decode($jsondata, true);
    if (!$data || !is_array($data)) {
        return "Invalid JSON data. <a href='/manage/$store/edit?id=$id'>Try Again</a>";
    }
    unset($data['_id']);
    $db->update($id, $data);
    header("Location: /manage/$store");
    exit;
});

// Delete action
Lean::get('/manage/{store}/delete', function($req) {
    $store = $req->params['store'];
    $id = $req->query['id'] ?? '';
    $db = Lean::db($store);
    $db->delete($id);
    header("Location: /manage/$store");
    exit;
});

// --- END Admin UI code ---

// Run the original Lean app
Lean::run();

/**
SAMPLE WORKING APP

// Save as index.php and place in the same folder as /Lean.php
require_once __DIR__.'/Lean.php';

// Home route
Lean::get('/', function($req, $res) {
    $user = Lean::user();
    $msg = $user->isAuthenticated()
        ? "Welcome, <b>{$user->getUsername()}</b>! Your role: <b>{$user->getRoleName()}</b>"
        : "Welcome, guest! Please log in or register.";
    return Lean::view_string("
        <h1>Lean Microframework v3.16 Demo</h1>
        <p>$msg</p>
        <p>
            <a href='" . Lean_url('register') . "'>Register</a> | 
            <a href='" . Lean_url('login') . "'>Login</a> | 
            <a href='" . Lean_url('logout') . "'>Logout</a>
        </p>
    ");
});

// Registration form
Lean::get('/register', function($req, $res) {
    return Lean::view_string('
        <h2>Register</h2>
        <form method="post" action="' . Lean_url('register') . '">
            <input name="username" placeholder="Username" required>
            <input name="email" type="email" placeholder="Email" required>
            <input name="password" type="password" placeholder="Password" required>
            <button type="submit">Register</button>
        </form>
        <p><a href="' . Lean_url() . '">Home</a></p>
    ');
});
Lean::post('/register', function($req, $res) {
    $user = Lean::user();
    $ok = $user->register(
        $req->input('username'),
        $req->input('email'),
        $req->input('password')
    );
    return Lean::view_string($ok
        ? "<b>Registration successful.</b> <a href='" . Lean_url('login') . "'>Login</a>"
        : "<b>Registration failed:</b> ".implode('; ', $user->getErrors())
    );
});

// Login form
Lean::get('/login', function($req, $res) {
    return Lean::view_string('
        <h2>Login</h2>
        <form method="post" action="' . Lean_url('login') . '">
            <input name="user" placeholder="Username or Email" required>
            <input name="password" type="password" placeholder="Password" required>
            <label><input type="checkbox" name="remember" value="1"> Remember me</label>
            <button type="submit">Login</button>
        </form>
        <p><a href="' . Lean_url() . '">Home</a></p>
    ');
});
Lean::post('/login', function($req, $res) {
    $user = Lean::user();
    $ok = $user->login(
        $req->input('user'),
        $req->input('password'),
        $req->input('remember') ? true : false
    );
    return Lean::view_string($ok
        ? "<b>Login successful.</b> <a href='" . Lean_url() . "'>Go Home</a>"
        : "<b>Login failed:</b> ".implode('; ', $user->getErrors())
    );
});

// Logout
Lean::get('/logout', function($req, $res) {
    $user = Lean::user();
    $user->logout();
    return Lean::view_string("You have been logged out. <a href='" . Lean_url() . "'>Return home</a>");
});

// Profile (protected)
Lean::get('/profile', function($req, $res) {
    $user = Lean::user();
    if (!$user->isAuthenticated()) {
        return $res->status(403)->body = "<b>Please <a href='" . Lean_url('login') . "'>login</a> to view your profile.</b>";
    }
    return Lean::view_string("
        <h2>Your Profile</h2>
        <p>Username: <b>{$user->getUsername()}</b></p>
        <p>Email: <b>{$user->getEmail()}</b></p>
        <p>Role: <b>{$user->getRoleName()}</b></p>
        <p><a href='" . Lean_url() . "'>Home</a></p>
    ");
});

// Admin-only page
Lean::get('/admin', function($req, $res) {
    $user = Lean::user();
    if (!$user->isAdmin()) {
        return $res->status(403)->body = "<b>Access denied. Admins only.</b>";
    }
    return Lean::view_string("
        <h2>Admin Panel</h2>
        <p>Welcome, Administrator <b>{$user->getUsername()}</b>.</p>
        <p><a href='" . Lean_url() . "'>Home</a></p>
    ");
});

// JSON API route
Lean::get('/api/user', function($req, $res) {
    $user = Lean::user();
    if (!$user->isAuthenticated()) {
        return $res->status(401)->json(['error' => 'Not authenticated']);
    }
    return $res->json([
        'user' => [
            'id' => $user->getId(),
            'username' => $user->getUsername(),
            'email' => $user->getEmail(),
            'role' => $user->getRoleName()
        ]
    ]);
});

// Simple notes CRUD using LeanDB
Lean::get('/notes', function($req, $res) {
    $db = Lean::db('notes');
    $notes = $db->fetch();
    $out = "<h2>Notes</h2><ul>";
    foreach ($notes as $n) {
        $out .= "<li>{$n['text']} <small>(id: {$n['_id']})</small></li>";
    }
    $out .= "</ul>
        <form method='post' action='" . Lean_url('notes') . "'>
            <input name='text' placeholder='New note...' required>
            <button>Add</button>
        </form>
        <p><a href='" . Lean_url() . "'>Home</a></p>";
    return Lean::view_string($out);
});
Lean::post('/notes', function($req, $res) {
    $db = Lean::db('notes');
    if (trim($req->input('text'))) {
        $db->insert(['text' => $req->input('text'), 'created' => time()]);
    }
    header('Location: ' . Lean_url('notes'));
    exit;
});

// Run the app!
Lean::run();

*/

?>