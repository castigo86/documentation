---
title: "Failover (HA)"
weight: 178
---

{{< toc >}}

{{< expand "Process Summary" "v" >}}
* **System > Support**
  * Update license
* **Network > Global Configuration**
  * Set the hostnames for both TrueNAS controllers
  * Set a virtual hostname
* **Network > Interfaces**
  * Interfaces cannot be edited when HA is enabled
  * Define the failover group
  * Set IP addresses for the controllers
  * Set the virtual IP address
    * This IP address is used to log in to the web interface from this point forward
* **System > Failover**
  * Designate the default TrueNAS controller
  * Define how long to wait after a network interruption to trigger a failover

{{< /expand >}}

## Configuring High Availability (HA)

To configure HA, turn on both units in the array and log in to the web interface for one of the units.
If this is the first login, the UI shows a dialog to upload the TrueNAS Enterprise License.
Otherwise, go to **System > Support** and update the license.

![SystemSupportLicenseEnterprise](/images/CORE/12.0/SystemSupportLicenseEnterprise.png "Enterprise License")

Paste the HA license received from iXsystems and save it.
The license contains the serial numbers for both units in the chassis.
Activating an HA license adds the **System > Failover** screen and modifies fields throughout the UI so that hostnames and IP addresses can be configured for both controllers.

After HA is configured, an icon shows when HA is active or unavailable.
When HA is disabled by the system administrator, the status icon changes to show HA is unavailable.
If the standby TrueNAS controller is not available because it is powered off, still starting up, disconnected from the network, or if failover has not been configured, the status icon changes to show HA is unavailable.
HA also becomes unavailable if a different number of disks are connected to each controller.

If both TrueNAS controllers reboot simultaneously, the passphrase for an encrypted pool must be entered at the web interface login screen.

### Networking

To make sure system networking is configured for HA, first go to **Network > Global Configuration**.

![NetworkGlobalConfigurationHAEnterprise](/images/CORE/12.0/NetworkGlobalConfigurationHAEnterprise.png "Network Config for Enterprise HA")

You can set the host names for both controllers and a virtual host name that reaches whichever controller is currently active.

Next, go to **Network > Interfaces** and edit the primary interface.

{{< hint warning >}}
Editing interfaces is disabled when HA is active.
To disable HA, go to **System > Failover** and disable failover.
Edit the interface, then reactivate failover immediately.
TrueNAS automatically synchronizes the configuration changes to the standby controller
{{< /hint >}}

![NetworkInterfaceEditHAEnterprise](/images/CORE/12.0/NetworkInterfaceEditHAEnterprise.png "Network Interface Edit for Enterprise HA")

You can designate the interface as critical for failover and combine multiple interfaces into a failover group.
There are also options to configure IP addresses for each controller and a virtual IP address with virtual host ID to use for administrative access.

After the network configuration is complete, log out and log back in, this time using the virtual IP address.
Pools and shares can now be configured as usual and configuration automatically synchronizes between the active and standby TrueNAS controllers.

All subsequent logins should use the virtual IP address.
Connecting directly to the standby TrueNAS controller with a browser does not allow web interface logins.

When troubleshooting HA networking, the <code>ifconfig</code> command adds two additional fields to the output to help with failover troubleshooting: **CriticalGroup*n*** and **Interlink**.

## Failover

To make general changes to the Failover settings, go to **System > Failover**

![System Failover Enterprise](/images/CORE/12.0/SystemFailoverEnterprise.png "HA Failover Options")

You can manually disable failover on this screen.

Make sure to set one of the controllers as the default, so that the default controller becomes active when both boot simultaneously.
Booting an HA pair with failover disabled causes both TrueNAS controllers to come up in standby mode.
In this situation, the web interface shows an option to force a TrueNAS controller to become active.

To have the system wait to failover during a network timeout, replace *0* with a new number of seconds.

{{< hint danger >}}
Do not *sync* the TrueNAS configuration unless directed by an iXsystems Support Engineer!
TrueNAS is designed to automatically synchronize the system configuration and the manual sync options are only for dangerous or high-risk troubleshooting situations.
{{< /hint >}}
