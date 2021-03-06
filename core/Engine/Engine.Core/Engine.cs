﻿using System.Collections.Generic;
using System.Linq;
using Engine.Core.Context;
using Engine.Core.Rules;
using LanguageExt;
using Engine.DataTypes;
using FSharpUtils.Newtonsoft;

namespace Engine.Core
{
    public delegate Option<IRule> RulesRepository(ConfigurationPath path);

    public static class EngineCore
    {
        public delegate Option<ConfigurationValue> GetRuleValue(ConfigurationPath path);

        public static GetRuleValue GetRulesEvaluator(HashSet<Identity> identities, GetLoadedContextByIdentityType contextByIdentity, RulesRepository rules)
        {
            var identityTypes = identities.Select(x => x.Type).ToArray();
            var flattenContext = ContextHelpers.FlattenLoadedContext(contextByIdentity);

            GetRuleValue getRuleValue = null;
            GetContextValue recursiveContext = key =>
            {
                if (key.StartsWith("@@key:")){
                    key = key.Replace("@@key:", "keys.");
                }
                if (!key.StartsWith("keys.")) return Option<JsonValue>.None;
                var path = new ConfigurationPath(key.Split('.')[1]);
                return getRuleValue(path).Map(x => x.Value);
            };

            var context = ContextHelpers.Merge(flattenContext, recursiveContext);

            getRuleValue = Memoize(path =>
            {
                foreach (var identity in identityTypes)
                {
                    var fixedResult = ContextHelpers.GetFixedConfigurationContext(context, identity)(path);
                    if (fixedResult.IsSome) return fixedResult;
                }
                return rules(path).Bind(x => x.GetValue(context));
            });
            return getRuleValue;
        }

        private static GetRuleValue Memoize(GetRuleValue getRuleValue)
        {
            var dict = new Dictionary<ConfigurationPath, Option<ConfigurationValue>>();
            return path =>
            {
                if (!dict.TryGetValue(path, out var result))
                {
                    result = getRuleValue(path);
                    dict[path] = result;
                }
                return result;
            };
        }
    }
}
