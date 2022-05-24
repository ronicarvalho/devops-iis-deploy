# Devops IIS Deploy

This extension was based on publishing code for deployment groups from the azure-pipelines-tasks project.

It's basically the original code with some other necessary routines taken from other packages in the project with the extra to do the replacement for client/endpoint nodes of the system.serviceModel.

The reason I chose to go this route instead of contributing code to the original project is that I needed to solve a publishing issue for yesterday.

## Replacement of the value of the address attribute through the name of the endpoint

```xml
</system.serviceModel>
	<client>
		<endpoint address="__Service-One__" contract="Contract.Of.My.ServiceOne" name="Service-One" />
		<endpoint address="__Service-Two__" contract="Contract.Of.My.ServiceTwo" name="Service-Two" />
		<endpoint address="__Service-Three__" contract="Contract.Of.My.ServiceThree" name="Service-Three" />
    </client>
</system.serviceModel>
```

In the release variables group, there must be a key/value for Service-One containing the desired address, in my case, each environment has a linked variable group, dev, staging, production, containing the same key with the respective values ​​of the environment.

I will upload the code to github as soon as possible.