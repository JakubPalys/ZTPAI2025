<?php

namespace Container8Vahkj6;

use Symfony\Component\DependencyInjection\Argument\RewindableGenerator;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\DependencyInjection\Exception\RuntimeException;

/**
 * @internal This class has been auto-generated by the Symfony Dependency Injection Component.
 */
class get_ServiceLocator_UNAQMaPService extends App_KernelDevDebugContainer
{
    /**
     * Gets the private '.service_locator.UNAQMaP' shared service.
     *
     * @return \Symfony\Component\DependencyInjection\ServiceLocator
     */
    public static function do($container, $lazyLoad = true)
    {
        return $container->privates['.service_locator.UNAQMaP'] = new \Symfony\Component\DependencyInjection\Argument\ServiceLocator($container->getService ??= $container->getService(...), [
            'security' => ['privates', '.errored.H0ym2.z', NULL, 'Cannot determine controller argument for "App\\Controller\\ProfileController::deleteAccount()": the $security argument is type-hinted with the non-existent class or interface: "Symfony\\Component\\Security\\Core\\Security".'],
        ], [
            'security' => '?',
        ]);
    }
}
