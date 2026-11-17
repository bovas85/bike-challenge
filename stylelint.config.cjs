const extendsConfig = [];

function tryExtend(name) {
  try {
    require.resolve(name);
    extendsConfig.push(name);
  } catch (e) {
    if (e.code !== "MODULE_NOT_FOUND") {
      extendsConfig.push(name);
    }
  }
}

tryExtend("stylelint-config-standard-scss");
tryExtend("stylelint-config-recommended-vue/scss");

module.exports = {
  extends: extendsConfig,
  rules: {
    "rule-empty-line-before": [
      "always",
      {
        except: ["first-nested"],
        ignore: ["after-comment"],
      },
    ],
    "at-rule-empty-line-before": [
      "always",
      {
        except: ["first-nested", "blockless-after-blockless"],
        ignore: ["after-comment"],
        ignoreAtRules: ["else"],
      },
    ],
    "comment-empty-line-before": [
      "always",
      {
        except: ["first-nested"],
        ignore: ["stylelint-commands"],
      },
    ],
    "selector-class-pattern": null,
    "keyframes-name-pattern": null,
    "scss/at-mixin-pattern": null,
    "selector-pseudo-element-colon-notation": "double",
    "length-zero-no-unit": true,
    "property-no-vendor-prefix": true,
    "value-no-vendor-prefix": true,
    "block-no-empty": true,
    "property-no-deprecated": true,
    "scss/comment-no-empty": true,
    "no-invalid-position-at-import-rule": true,
    "scss/load-no-partial-leading-underscore": null,
    "scss/no-global-function-names": null,
  },
};
