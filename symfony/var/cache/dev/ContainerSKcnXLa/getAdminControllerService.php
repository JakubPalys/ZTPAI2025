<?php

namespace ContainerSKcnXLa;

use Symfony\Component\DependencyInjection\Argument\RewindableGenerator;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\DependencyInjection\Exception\RuntimeException;

/**
 * @internal This class has been auto-generated by the Symfony Dependency Injection Component.
 */
class getAdminControllerService extends App_KernelDevDebugContainer
{
    /**
     * Gets the public 'App\Controller\AdminController' shared autowired service.
     *
     * @return \App\Controller\AdminController
     */
    public static function do($container, $lazyLoad = true)
    {
        include_once \dirname(__DIR__, 4).'/vendor/symfony/framework-bundle/Controller/AbstractController.php';
        include_once \dirname(__DIR__, 4).'/src/Controller/AdminController.php';

        $container->services['App\\Controller\\AdminController'] = $instance = new \App\Controller\AdminController(($container->privates['App\\Repository\\EventRepository'] ?? $container->load('getEventRepositoryService')), ($container->privates['App\\Repository\\UserRepository'] ?? $container->load('getUserRepositoryService')), ($container->privates['App\\Repository\\BetRepository'] ?? $container->load('getBetRepositoryService')), ($container->services['doctrine.orm.default_entity_manager'] ?? $container->load('getDoctrine_Orm_DefaultEntityManagerService')));

        $instance->setContainer(($container->privates['.service_locator.ZyP9f7K'] ?? $container->load('get_ServiceLocator_ZyP9f7KService'))->withContext('App\\Controller\\AdminController', $container));

        return $instance;
    }
}
