<?php

// This file has been auto-generated by the Symfony Dependency Injection Component for internal use.

if (\class_exists(\Container36uhzov\App_KernelDevDebugContainer::class, false)) {
    // no-op
} elseif (!include __DIR__.'/Container36uhzov/App_KernelDevDebugContainer.php') {
    touch(__DIR__.'/Container36uhzov.legacy');

    return;
}

if (!\class_exists(App_KernelDevDebugContainer::class, false)) {
    \class_alias(\Container36uhzov\App_KernelDevDebugContainer::class, App_KernelDevDebugContainer::class, false);
}

return new \Container36uhzov\App_KernelDevDebugContainer([
    'container.build_hash' => '36uhzov',
    'container.build_id' => '180df501',
    'container.build_time' => 1741038077,
    'container.runtime_mode' => \in_array(\PHP_SAPI, ['cli', 'phpdbg', 'embed'], true) ? 'web=0' : 'web=1',
], __DIR__.\DIRECTORY_SEPARATOR.'Container36uhzov');
